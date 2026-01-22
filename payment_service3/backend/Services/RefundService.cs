using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Services;

public interface IRefundService
{
    Task<List<RefundRequest>> GetAllRefundsAsync();
    Task<RefundRequest?> GetRefundByIdAsync(string id);
    Task<List<RefundRequest>> GetRefundsByStatusAsync(RefundStatus status);
    Task<List<RefundRequest>> GetRefundsByUserAsync(string userId);
    Task<RefundRequest> CreateRefundRequestAsync(RefundRequestDto dto);
    Task<RefundRequest?> ReviewRefundAsync(string id, ReviewRefundDto dto);
    Task<RefundRequest?> ProcessRefundToWalletAsync(string id);
    Task<bool> ContactCustomerAsync(ContactCustomerDto dto);
    Task<RefundStats> GetRefundStatsAsync();
}

public class RefundService : IRefundService
{
    private readonly PaymentDbContext _context; // <-- Now using Real DB
    private readonly IWalletService _walletService;
    private readonly ILogger<RefundService> _logger;

    public RefundService(PaymentDbContext context, IWalletService walletService, ILogger<RefundService> logger)
    {
        _context = context;
        _walletService = walletService;
        _logger = logger;
    }

    public async Task<List<RefundRequest>> GetAllRefundsAsync()
    {
        return await _context.Refunds
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<RefundRequest?> GetRefundByIdAsync(string id)
    {
        return await _context.Refunds.FindAsync(id);
    }

    public async Task<List<RefundRequest>> GetRefundsByStatusAsync(RefundStatus status)
    {
        return await _context.Refunds
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<RefundRequest>> GetRefundsByUserAsync(string userId)
    {
        return await _context.Refunds
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<RefundRequest> CreateRefundRequestAsync(RefundRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.OrderId))
        {
            throw new InvalidOperationException("OrderId is required");
        }

        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == dto.OrderId);
        if (order == null)
        {
            throw new InvalidOperationException($"Order '{dto.OrderId}' not found");
        }

        // Only completed/paid orders are valid for refund.
        var orderStatus = (order.Status ?? string.Empty).ToLowerInvariant();
        if (orderStatus != "completed" && orderStatus != "paid")
        {
            throw new InvalidOperationException("Only paid/completed orders are valid for refund");
        }

        var userId = !string.IsNullOrWhiteSpace(dto.UserId) ? dto.UserId : order.UserId;

        // Prevent duplicate refund requests for the same order unless a previous request was rejected.
        var existingRefund = await _context.Refunds
            .Where(r => r.OrderId == dto.OrderId && r.UserId == userId)
            .Where(r => r.Status != RefundStatus.Rejected)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (existingRefund != null)
        {
            throw new InvalidOperationException($"A refund request already exists for order '{dto.OrderId}'.");
        }

        var amount = dto.Amount > 0 ? dto.Amount : order.Amount;
        if (amount <= 0)
        {
            throw new InvalidOperationException("Refund amount must be greater than 0");
        }

        var refund = new RefundRequest
        {
            UserId = userId,
            OrderId = dto.OrderId,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            Amount = amount,
            Reason = dto.Reason,
            Category = dto.Category,
            PhotoPath = dto.PhotoPath,
            Status = RefundStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // SAVE TO SQL DATABASE
        _context.Refunds.Add(refund);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created refund request {RefundId} in Database", refund.Id);
        return refund;
    }

    public async Task<RefundRequest?> ReviewRefundAsync(string id, ReviewRefundDto dto)
    {
        var refund = await _context.Refunds.FindAsync(id);
        if (refund == null) return null;

        refund.AdminNotes = dto.AdminNotes;
        refund.ReviewedAt = DateTime.UtcNow;
        refund.ReviewedBy = dto.ReviewedBy;

        if (dto.Action.ToLower() == "approve")
        {
            refund.Status = RefundStatus.Approved;
            // Persist the approval, then immediately credit wallet as part of the approve action.
            await _context.SaveChangesAsync();
            return await ProcessRefundToWalletAsync(id);
        }
        else if (dto.Action.ToLower() == "reject")
        {
            refund.Status = RefundStatus.Rejected;
            refund.RejectionReason = dto.RejectionReason;
        }

        // Update SQL Database
        await _context.SaveChangesAsync();
        return refund;
    }

    public async Task<RefundRequest?> ProcessRefundToWalletAsync(string id)
    {
        var refund = await _context.Refunds.FindAsync(id);
        if (refund == null) return null;

        if (refund.Status == RefundStatus.Completed) return refund;

        if (refund.Status != RefundStatus.Approved)
        {
            throw new InvalidOperationException($"Refund must be approved first. Current: {refund.Status}");
        }

        try
        {
            // Credit the wallet
            var safeTransactionId = $"refund_{refund.Id}";
            if (safeTransactionId.Length > 20) safeTransactionId = safeTransactionId[..20];

            var wallet = await _walletService.AddBalanceAsync(
                refund.UserId,
                refund.Amount,
                safeTransactionId,
                $"Refund for Order {refund.OrderId}",
                "refund"
            );

            // Mark completed in DB
            refund.Status = RefundStatus.Completed;
            refund.CompletedAt = DateTime.UtcNow;
            refund.WalletCredited = true;
            refund.WalletTransactionId = safeTransactionId;

            await _context.SaveChangesAsync();
            return refund;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process refund {Id}", id);
            throw;
        }
    }

    public async Task<bool> ContactCustomerAsync(ContactCustomerDto dto)
    {
        var refund = await _context.Refunds.FindAsync(dto.RefundId);
        if (refund == null) return false;

        _logger.LogInformation("Contacting customer {Name}...", refund.CustomerName);
        return true;
    }

    public async Task<RefundStats> GetRefundStatsAsync()
    {
        // Use SQL COUNT for performance
        var stats = new RefundStats
        {
            TotalRequests = await _context.Refunds.CountAsync(),
            PendingCount = await _context.Refunds.CountAsync(r => r.Status == RefundStatus.Pending || r.Status == RefundStatus.UnderReview),
            ApprovedCount = await _context.Refunds.CountAsync(r => r.Status == RefundStatus.Approved || r.Status == RefundStatus.Completed),
            RejectedCount = await _context.Refunds.CountAsync(r => r.Status == RefundStatus.Rejected),
            TotalRefundedAmount = await _context.Refunds
                .Where(r => r.Status == RefundStatus.Approved || r.Status == RefundStatus.Completed)
                .SumAsync(r => r.Amount)
        };
        return stats;
    }
}
