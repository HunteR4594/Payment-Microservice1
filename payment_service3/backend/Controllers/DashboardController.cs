using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Integrations;
using PaymentService.Models;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly PaymentDbContext _context;
    private readonly IOrderServiceClient _orderService;

    public DashboardController(PaymentDbContext context, IOrderServiceClient orderService)
    {
        _context = context;
        _orderService = orderService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetStats([FromQuery] string? userId = null)
    {
        userId ??= ResolveUserId(userId);

        var wallet = await _context.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId);

        var walletBalance = wallet?.Balance ?? 0m;
        var walletCoins = wallet?.Coins ?? 0;

        var orderServiceConfigured = _orderService.IsConfigured;
        var orderServiceHealthy = false;
        string? orderServiceError = null;

        var localPendingOrders = await _context.Orders.CountAsync(o => o.UserId == userId && o.Status == "pending");

        int pendingOrders;
        if (orderServiceConfigured)
        {
            try
            {
                pendingOrders = await _orderService.GetPendingCountAsync(userId);
                orderServiceHealthy = true;
            }
            catch (Exception ex)
            {
                orderServiceError = ex.Message;
                pendingOrders = localPendingOrders;
            }
        }
        else
        {
            pendingOrders = localPendingOrders;
        }

        var availableVouchers = await _context.Vouchers.CountAsync(v => v.IsActive && v.ValidUntil > DateTime.UtcNow);

        var refundRequests = await _context.Refunds.CountAsync(r =>
            r.UserId == userId && (r.Status == RefundStatus.Pending || r.Status == RefundStatus.UnderReview));

        var recentTransactions = await _context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .AsNoTracking()
            .ToListAsync();

        return Ok(new DashboardStatsResponse
        {
            WalletBalance = walletBalance,
            WalletCoins = walletCoins,
            PendingOrders = pendingOrders,
            OrderServiceConfigured = orderServiceConfigured,
            OrderServiceHealthy = orderServiceHealthy,
            OrderServiceError = orderServiceError,
            AvailableVouchers = availableVouchers,
            RefundRequests = refundRequests,
            RecentTransactions = recentTransactions
        });
    }

    private string ResolveUserId(string? userId)
    {
        if (!string.IsNullOrWhiteSpace(userId) && User.IsInRole("Admin")) return userId;
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;
        if (!string.IsNullOrWhiteSpace(claim)) return claim;
        return "user_001";
    }
}

public class DashboardStatsResponse
{
    public decimal WalletBalance { get; set; }
    public int WalletCoins { get; set; }
    public int PendingOrders { get; set; }
    public bool OrderServiceConfigured { get; set; }
    public bool OrderServiceHealthy { get; set; }
    public string? OrderServiceError { get; set; }
    public int AvailableVouchers { get; set; }
    public int RefundRequests { get; set; }
    public List<Transaction> RecentTransactions { get; set; } = new();
}
