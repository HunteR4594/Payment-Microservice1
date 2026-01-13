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
                $"Refund for Order {refund.OrderId}"
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
