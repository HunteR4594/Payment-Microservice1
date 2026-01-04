using Microsoft.AspNetCore.Mvc;
using PaymentApi.Models;
using PaymentApi.Services;

namespace PaymentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    /// <summary>
    /// Get wallet balance and info
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<WalletResponse>> GetWallet([FromQuery] string userId = "user_001")
    {
        var wallet = await _walletService.GetWalletAsync(userId);
        return Ok(new WalletResponse
        {
            Success = true,
            Data = wallet
        });
    }

    /// <summary>
    /// Get transaction history
    /// </summary>
    [HttpGet("transactions")]
    public async Task<ActionResult<TransactionListResponse>> GetTransactions(
        [FromQuery] string userId = "user_001",
        [FromQuery] int limit = 10)
    {
        var transactions = await _walletService.GetTransactionsAsync(userId, limit);
        return Ok(new TransactionListResponse
        {
            Success = true,
            Data = transactions,
            Total = transactions.Count
        });
    }
}
