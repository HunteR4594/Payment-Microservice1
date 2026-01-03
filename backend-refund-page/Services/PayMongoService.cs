using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using backend_refund_page.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend_refund_page.Services
{
    public class PayMongoService
    {
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;
        private readonly string _baseUrl;
        private readonly ILogger<PayMongoService> _logger;

        public PayMongoService(HttpClient httpClient, IConfiguration configuration, ILogger<PayMongoService> logger)
        {
            _httpClient = httpClient;
            _secretKey = configuration["PayMongo:SecretKey"];
            _baseUrl = configuration["PayMongo:BaseUrl"];
            _logger = logger;

            // Set up Basic Auth with secret key
            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_secretKey}:"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        /// Creates a refund for a PayMongo payment
        /// </summary>
        /// <param name="paymentId">The PayMongo payment ID (e.g., pay_xxxxx)</param>
        /// <param name="amount">Amount to refund in centavos (e.g., 10000 = 100.00 PHP)</param>
        /// <param name="reason">Reason for refund: requested_by_customer, duplicate, fraudulent, others</param>
        /// <param name="notes">Optional notes</param>
        /// <returns>PayMongo refund response</returns>
        public async Task<PayMongoRefundResponse> CreateRefundAsync(string paymentId, long amount, string reason, string notes = null)
        {
            try
            {
                // Map reason to PayMongo accepted values
                var paymongoReason = MapReasonToPayMongo(reason);

                var requestBody = new
                {
                    data = new
                    {
                        attributes = new
                        {
                            amount = amount,
                            payment_id = paymentId,
                            reason = paymongoReason,
                            notes = notes
                        }
                    }
                };

                var jsonContent = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                });

                _logger.LogInformation($"Creating refund for payment {paymentId}, amount: {amount}, reason: {paymongoReason}");

                var response = await _httpClient.PostAsync(
                    $"{_baseUrl}/refunds",
                    new StringContent(jsonContent, Encoding.UTF8, "application/json")
                );

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"PayMongo response: {responseContent}");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"PayMongo refund failed: {response.StatusCode} - {responseContent}");
                    throw new Exception($"PayMongo refund failed: {responseContent}");
                }

                var refundResponse = JsonSerializer.Deserialize<PayMongoRefundResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                    PropertyNameCaseInsensitive = true
                });

                return refundResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PayMongo refund");
                throw;
            }
        }

        /// <summary>
        /// Gets the status of a refund
        /// </summary>
        public async Task<PayMongoRefundResponse> GetRefundAsync(string refundId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/refunds/{refundId}");
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to get refund: {responseContent}");
                }

                return JsonSerializer.Deserialize<PayMongoRefundResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PayMongo refund");
                throw;
            }
        }

        /// <summary>
        /// Maps user-friendly reason to PayMongo accepted values
        /// </summary>
        private string MapReasonToPayMongo(string reason)
        {
            return reason?.ToLower() switch
            {
                "damaged order" => "others",
                "incorrect ordered item/s" => "others",
                "did not receive some/all of the items" => "others",
                "duplicate" => "duplicate",
                "fraudulent" => "fraudulent",
                "requested_by_customer" => "requested_by_customer",
                _ => "others"
            };
        }
    }
}
