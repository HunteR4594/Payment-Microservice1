using Microsoft.AspNetCore.Mvc;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers;

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
    public async Task<ActionResult<WalletResponse>> GetWallet([FromQuery] string? userId = null)
    {
        userId ??= HttpContext.Request.Headers["X-User-Id"].FirstOrDefault();
        userId ??= "user_001";
        var wallet = await _walletService.GetWalletAsync(userId);
        return Ok(new WalletResponse
        {
            Success = true,
            Data = wallet
        });
    }

    /// <summary>
    /// Get wallet by user ID path parameter
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<WalletResponse>> GetWalletByPath(string userId)
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
        [FromQuery] string? userId = null,
        [FromQuery] int limit = 10)
    {
        userId ??= HttpContext.Request.Headers["X-User-Id"].FirstOrDefault();
        userId ??= "user_001";
        var transactions = await _walletService.GetTransactionsAsync(userId, limit);
        return Ok(new TransactionListResponse
        {
            Success = true,
            Data = transactions,
            Total = transactions.Count
        });
    }

    /// <summary>
    /// Update wallet balance
    /// </summary>
    [HttpPut("{userId}/balance")]
    public async Task<ActionResult<WalletResponse>> UpdateBalance(string userId, [FromBody] UpdateBalanceRequest request)
    {
        try
        {
            var wallet = await _walletService.AddBalanceAsync(userId, request.Amount, null, request.Description, "topup");
            return Ok(new WalletResponse
            {
                Success = true,
                Data = wallet
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new WalletResponse
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    /// <summary>
    /// Use coins from wallet
    /// </summary>
    [HttpPost("{userId}/use-coins")]
    public async Task<ActionResult<WalletResponse>> UseCoins(string userId, [FromBody] UseCoinsRequest request)
    {
        try
        {
            var wallet = await _walletService.UseCoinsAsync(userId, request.Amount, null, "Coins used");
            return Ok(new WalletResponse
            {
                Success = true,
                Data = wallet
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new WalletResponse
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}

public class UpdateBalanceRequest
{
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class UseCoinsRequest
{
    public int Amount { get; set; }
}
