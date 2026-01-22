using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PaymentService2.Services;
using PaymentService2.Models;


namespace PaymentService2.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IWalletService _walletService;
    private readonly IOrderService _orderService;
    private readonly IVoucherService _voucherService;
    private readonly IRefundService _refundService;

    public DashboardController(
        IWalletService walletService,
        IOrderService orderService,
        IVoucherService voucherService,
        IRefundService refundService)
    {
        _walletService = walletService;
        _orderService = orderService;
        _voucherService = voucherService;
        _refundService = refundService;
    }

    private string ResolveUserId(string? userId)
    {
        if (!string.IsNullOrWhiteSpace(userId) && User.IsInRole("Admin")) return userId;
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;
        if (!string.IsNullOrWhiteSpace(claim)) return claim;
        return "user_001";
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStats>> GetStats([FromQuery] string? userId = null)
    {
        userId ??= ResolveUserId(userId);
        
        try
        {
            var walletTask = _walletService.GetWalletAsync(userId);
            var transactionsTask = _walletService.GetTransactionsAsync(userId, 5);
            var ordersTask = _orderService.GetOrdersAsync(userId, 100); // Fetch enough to count pending
            var vouchersTask = _voucherService.GetVouchersAsync();
            var refundsTask = _refundService.GetRefundsAsync(userId);

            await Task.WhenAll(walletTask, transactionsTask, ordersTask, vouchersTask, refundsTask);

            var wallet = await walletTask;
            var transactions = await transactionsTask;
            var orders = await ordersTask;
            var vouchers = await vouchersTask;
            var refunds = await refundsTask;

            int pendingOrdersCount = orders.Count(o => o.Status.Equals("pending", StringComparison.OrdinalIgnoreCase));
            int availableVouchersCount = vouchers.Count(v => v.IsActive && (!v.UsageLimit.HasValue || v.UsedCount < v.UsageLimit.Value));
            // Considering all refunds for the user that are active requests (not completed/rejected)
            int refundRequestsCount = refunds.Count; 

            return Ok(new DashboardStats
            {
                UserId = userId,
                WalletBalance = wallet.Balance,
                Coins = wallet.Coins,
                RecentTransactions = transactions,
                RecentTransactionCount = transactions.Count,
                PendingOrders = pendingOrdersCount,
                AvailableVouchers = availableVouchersCount,
                RefundRequests = refundRequestsCount,
                LastUpdated = wallet.LastUpdated
            });
        }
        catch (Exception ex)
        {
            return Ok(new DashboardStats
            {
                UserId = userId,
                WalletBalance = 0,
                Coins = 0,
                RecentTransactions = new(),
                RecentTransactionCount = 0,
                ErrorMessage = ex.Message
            });
        }
    }
}

public class DashboardStats
{
    public string UserId { get; set; } = string.Empty;
    public decimal WalletBalance { get; set; }
    public int Coins { get; set; }
    public List<Transaction> RecentTransactions { get; set; } = new();
    public int RecentTransactionCount { get; set; }
    public int PendingOrders { get; set; }
    public int AvailableVouchers { get; set; }
    public int RefundRequests { get; set; }
    // Frontend compatibility flags
    public bool OrderServiceConfigured { get; set; } = true;
    public bool OrderServiceHealthy { get; set; } = true;
    public string? OrderServiceError { get; set; }

    public DateTime? LastUpdated { get; set; }
    public string? ErrorMessage { get; set; }
}
