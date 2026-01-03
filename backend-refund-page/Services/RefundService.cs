using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend_refund_page.Models;
using Microsoft.Extensions.Logging;

namespace backend_refund_page.Services
{
    public class RefundService
    {
        private readonly List<Refund> _refunds = new List<Refund>();
        private readonly PayMongoService _payMongoService;
        private readonly ILogger<RefundService> _logger;

        public RefundService(PayMongoService payMongoService, ILogger<RefundService> logger)
        {
            _payMongoService = payMongoService;
            _logger = logger;
        }

        public IEnumerable<Refund> GetAll()
        {
            return _refunds;
        }

        public Refund GetById(Guid id)
        {
            return _refunds.Find(r => r.Id == id);
        }

        /// <summary>
        /// Creates a refund request (pending status, not yet processed)
        /// </summary>
        public Refund Create(RefundRequest request)
        {
            var refund = new Refund
            {
                Id = Guid.NewGuid(),
                PaymentId = request.PaymentId,
                Amount = request.Amount,
                Reason = request.Reason,
                Notes = request.Notes,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _refunds.Add(refund);
            return refund;
        }

        /// <summary>
        /// Creates and immediately processes a refund through PayMongo
        /// </summary>
        public async Task<Refund> CreateAndProcessRefundAsync(RefundRequest request)
        {
            var refund = new Refund
            {
                Id = Guid.NewGuid(),
                PaymentId = request.PaymentId,
                Amount = request.Amount,
                Reason = request.Reason,
                Notes = request.Notes,
                Status = "Processing",
                CreatedAt = DateTime.UtcNow
            };
            _refunds.Add(refund);

            try
            {
                // Convert amount to centavos (PayMongo uses centavos)
                var amountInCentavos = (long)(request.Amount * 100);

                _logger.LogInformation($"Processing refund for payment {request.PaymentId}, amount: {amountInCentavos} centavos");

                var payMongoResponse = await _payMongoService.CreateRefundAsync(
                    request.PaymentId,
                    amountInCentavos,
                    request.Reason,
                    request.Notes
                );

                refund.PayMongoRefundId = payMongoResponse.Data.Id;
                refund.Status = payMongoResponse.Data.Attributes.Status == "succeeded" ? "Approved" : "Processing";

                _logger.LogInformation($"Refund processed: {refund.PayMongoRefundId}, status: {refund.Status}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process refund through PayMongo");
                refund.Status = "Failed";
                refund.Notes = $"PayMongo Error: {ex.Message}";
            }

            return refund;
        }

        /// <summary>
        /// Process a pending refund through PayMongo
        /// </summary>
        public async Task<Refund> ProcessRefundAsync(Guid id)
        {
            var refund = GetById(id);
            if (refund == null)
            {
                return null;
            }

            if (refund.Status != "Pending")
            {
                throw new InvalidOperationException($"Refund is already {refund.Status}");
            }

            refund.Status = "Processing";

            try
            {
                var amountInCentavos = (long)(refund.Amount * 100);

                var payMongoResponse = await _payMongoService.CreateRefundAsync(
                    refund.PaymentId,
                    amountInCentavos,
                    refund.Reason,
                    refund.Notes
                );

                refund.PayMongoRefundId = payMongoResponse.Data.Id;
                refund.Status = payMongoResponse.Data.Attributes.Status == "succeeded" ? "Approved" : "Processing";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process refund through PayMongo");
                refund.Status = "Failed";
                refund.Notes = $"PayMongo Error: {ex.Message}";
            }

            return refund;
        }

        public bool UpdateStatus(Guid id, string status)
        {
            var refund = GetById(id);
            if (refund == null) return false;
            refund.Status = status;
            return true;
        }

        public void UpdatePhotoPath(Guid id, string photoPath)
        {
            var refund = GetById(id);
            if (refund != null)
            {
                refund.PhotoPath = photoPath;
            }
        }
    }
}