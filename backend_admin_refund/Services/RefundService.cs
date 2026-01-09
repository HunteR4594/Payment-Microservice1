using backend_admin_refund.Models;

namespace backend_admin_refund.Services;

public class RefundService : IRefundService
{
    private readonly ILogger<RefundService> _logger;
    private static readonly List<RefundRequest> _refunds = new()
    {
        // Sample data for testing
        new RefundRequest
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            OrderId = "ORD-001",
            CustomerName = "John Doe",
            CustomerEmail = "john@example.com",
            CustomerPhone = "09171234567",
            Amount = 250.00m,
            Reason = "Wrong order received",
            Category = "Wrong Order",
            Status = RefundStatus.Pending,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new RefundRequest
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            OrderId = "ORD-002",
            CustomerName = "Jane Smith",
            CustomerEmail = "jane@example.com",
            CustomerPhone = "09181234567",
            Amount = 450.00m,
            Reason = "Coffee was cold upon delivery",
            Category = "Quality Issue",
            Status = RefundStatus.UnderReview,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        },
        new RefundRequest
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            OrderId = "ORD-003",
            CustomerName = "Bob Wilson",
            CustomerEmail = "bob@example.com",
            CustomerPhone = "09191234567",
            Amount = 180.00m,
            Reason = "Order arrived 2 hours late",
            Category = "Late Delivery",
            Status = RefundStatus.Approved,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            ReviewedAt = DateTime.UtcNow.AddDays(-4),
            ReviewedBy = "Admin"
        }
    };

    public RefundService(ILogger<RefundService> logger)
    {
        _logger = logger;
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

    public Task<RefundRequest> CreateRefundRequestAsync(RefundRequestDto dto)
    {
        var refund = new RefundRequest
        {
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
        _logger.LogInformation("Created refund request {RefundId} for order {OrderId}", refund.Id, refund.OrderId);
        
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
