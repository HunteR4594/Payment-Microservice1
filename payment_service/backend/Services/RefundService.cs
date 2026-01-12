using PaymentService.Models;

namespace PaymentService.Services;

public interface IRefundService
{
    Task<List<RefundRequest>> GetAllRefundsAsync();
    Task<RefundRequest?> GetRefundByIdAsync(Guid id);
    Task<List<RefundRequest>> GetRefundsByStatusAsync(RefundStatus status);
    Task<List<RefundRequest>> GetRefundsByUserAsync(string userId);
    Task<RefundRequest> CreateRefundRequestAsync(RefundRequestDto dto);
    Task<RefundRequest?> ReviewRefundAsync(Guid id, ReviewRefundDto dto);
    Task<RefundRequest?> ProcessRefundToWalletAsync(Guid id);  // New: approve and credit wallet
    Task<bool> ContactCustomerAsync(ContactCustomerDto dto);
    Task<RefundStats> GetRefundStatsAsync();
}

public class RefundService : IRefundService
{
    private readonly ILogger<RefundService> _logger;
    private readonly IWalletService _walletService;
    
    private static readonly List<RefundRequest> _refunds = new()
    {
        // Sample data for testing
        new RefundRequest
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            UserId = "user_001",
            OrderId = "ord_001",
            CustomerName = "Kapebara User",
            CustomerEmail = "user@example.com",
            CustomerPhone = "09171234567",
            Amount = 150.00m,
            Reason = "Wrong order received - I ordered Iced Latte but got Hot Americano",
            Category = "Wrong Order",
            Status = RefundStatus.Pending,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new RefundRequest
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            UserId = "user_001",
            OrderId = "ord_002",
            CustomerName = "Kapebara User",
            CustomerEmail = "user@example.com",
            CustomerPhone = "09171234567",
            Amount = 85.00m,
            Reason = "Coffee was cold upon delivery",
            Category = "Quality Issue",
            Status = RefundStatus.UnderReview,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        },
        new RefundRequest
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            UserId = "user_001",
            OrderId = "ord_003",
            CustomerName = "Kapebara User",
            CustomerEmail = "user@example.com",
            CustomerPhone = "09191234567",
            Amount = 225.00m,
            Reason = "Order arrived 2 hours late",
            Category = "Late Delivery",
            Status = RefundStatus.Approved,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            ReviewedAt = DateTime.UtcNow.AddDays(-4),
            ReviewedBy = "Admin"
        }
    };

    public RefundService(ILogger<RefundService> logger, IWalletService walletService)
    {
        _logger = logger;
        _walletService = walletService;
    }

    public Task<List<RefundRequest>> GetAllRefundsAsync()
    {
        _logger.LogInformation("Getting all refund requests");
        return Task.FromResult(_refunds.OrderByDescending(r => r.CreatedAt).ToList());
    }

    public Task<RefundRequest?> GetRefundByIdAsync(Guid id)
    {
        var refund = _refunds.FirstOrDefault(r => r.Id == id);
        return Task.FromResult(refund);
    }

    public Task<List<RefundRequest>> GetRefundsByStatusAsync(RefundStatus status)
    {
        var refunds = _refunds.Where(r => r.Status == status)
                              .OrderByDescending(r => r.CreatedAt)
                              .ToList();
        return Task.FromResult(refunds);
    }

    public Task<List<RefundRequest>> GetRefundsByUserAsync(string userId)
    {
        var refunds = _refunds.Where(r => r.UserId == userId)
                              .OrderByDescending(r => r.CreatedAt)
                              .ToList();
        return Task.FromResult(refunds);
    }

    public Task<RefundRequest> CreateRefundRequestAsync(RefundRequestDto dto)
    {
        var refund = new RefundRequest
        {
            UserId = dto.UserId,
            OrderId = dto.OrderId,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            Amount = dto.Amount,
            Reason = dto.Reason,
            Category = dto.Category,
            Status = RefundStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _refunds.Add(refund);
        _logger.LogInformation("Created refund request {RefundId} for order {OrderId}, user {UserId}", 
            refund.Id, refund.OrderId, refund.UserId);
        
        return Task.FromResult(refund);
    }

    public Task<RefundRequest?> ReviewRefundAsync(Guid id, ReviewRefundDto dto)
    {
        var refund = _refunds.FirstOrDefault(r => r.Id == id);
        if (refund == null)
        {
            _logger.LogWarning("Refund {RefundId} not found", id);
            return Task.FromResult<RefundRequest?>(null);
        }

        refund.AdminNotes = dto.AdminNotes;
        refund.ReviewedAt = DateTime.UtcNow;
        refund.ReviewedBy = dto.ReviewedBy;

        if (dto.Action.ToLower() == "approve")
        {
            refund.Status = RefundStatus.Approved;
            _logger.LogInformation("Refund {RefundId} approved by {Admin}", id, dto.ReviewedBy);
        }
        else if (dto.Action.ToLower() == "reject")
        {
            refund.Status = RefundStatus.Rejected;
            refund.RejectionReason = dto.RejectionReason;
            _logger.LogInformation("Refund {RefundId} rejected by {Admin}", id, dto.ReviewedBy);
        }

        return Task.FromResult<RefundRequest?>(refund);
    }

    public Task<bool> ContactCustomerAsync(ContactCustomerDto dto)
    {
        var refund = _refunds.FirstOrDefault(r => r.Id == dto.RefundId);
        if (refund == null)
        {
            _logger.LogWarning("Cannot contact customer - Refund {RefundId} not found", dto.RefundId);
            return Task.FromResult(false);
        }

        // In production, this would send an actual email or SMS
        _logger.LogInformation(
            "Contacting customer {CustomerName} via {Method} - Subject: {Subject}",
            refund.CustomerName,
            dto.ContactMethod,
            dto.Subject
        );

        return Task.FromResult(true);
    }

    /// <summary>
    /// Process an approved refund by crediting the user's wallet
    /// </summary>
    public async Task<RefundRequest?> ProcessRefundToWalletAsync(Guid id)
    {
        var refund = _refunds.FirstOrDefault(r => r.Id == id);
        if (refund == null)
        {
            _logger.LogWarning("Refund {RefundId} not found", id);
            return null;
        }

        if (refund.Status == RefundStatus.Completed)
        {
            _logger.LogWarning("Refund {RefundId} is already completed", id);
            return refund;
        }

        if (refund.Status != RefundStatus.Approved)
        {
            _logger.LogWarning("Refund {RefundId} is not approved, cannot process. Status: {Status}", id, refund.Status);
            throw new InvalidOperationException($"Refund must be approved before processing. Current status: {refund.Status}");
        }

        if (string.IsNullOrEmpty(refund.UserId))
        {
            _logger.LogError("Refund {RefundId} has no UserId, cannot credit wallet", id);
            throw new InvalidOperationException("Refund has no associated user");
        }

        try
        {
            // Credit the user's wallet
            var wallet = await _walletService.AddBalanceAsync(
                refund.UserId,
                refund.Amount,
                $"refund_{refund.Id:N}"[..20],
                $"Refund for Order {refund.OrderId}"
            );

            refund.Status = RefundStatus.Completed;
            refund.CompletedAt = DateTime.UtcNow;
            refund.WalletCredited = true;
            refund.WalletTransactionId = $"refund_{refund.Id:N}"[..20];

            _logger.LogInformation(
                "Refund {RefundId} completed. Credited ₱{Amount} to user {UserId}. New wallet balance: ₱{Balance}",
                id, refund.Amount, refund.UserId, wallet.Balance
            );

            return refund;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to credit wallet for refund {RefundId}", id);
            throw;
        }
    }

    public Task<RefundStats> GetRefundStatsAsync()
    {
        var stats = new RefundStats
        {
            TotalRequests = _refunds.Count,
            PendingCount = _refunds.Count(r => r.Status == RefundStatus.Pending || r.Status == RefundStatus.UnderReview),
            ApprovedCount = _refunds.Count(r => r.Status == RefundStatus.Approved || r.Status == RefundStatus.Completed),
            RejectedCount = _refunds.Count(r => r.Status == RefundStatus.Rejected),
            TotalRefundedAmount = _refunds.Where(r => r.Status == RefundStatus.Approved || r.Status == RefundStatus.Completed)
                                          .Sum(r => r.Amount)
        };

        return Task.FromResult(stats);
    }
}
