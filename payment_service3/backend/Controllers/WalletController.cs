using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    private string ResolveUserId(string? userId)
    {
        if (!string.IsNullOrWhiteSpace(userId) && User.IsInRole("Admin")) return userId;
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;
        if (!string.IsNullOrWhiteSpace(claim)) return claim;
        return "user_001";
    }

    /// <summary>
    /// Get wallet balance and info
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<WalletResponse>> GetWallet([FromQuery] string? userId = null)
    {
        userId ??= ResolveUserId(userId);
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
        // Admins may query arbitrary user wallets; regular users may only query their own
        if (!User.IsInRole("Admin"))
        {
            var callerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(callerId) || callerId != userId) return Forbid();
        }

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
        userId ??= ResolveUserId(userId);
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
            // Only admins may update arbitrary user balances
            if (!User.IsInRole("Admin")) return Forbid();

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
            // Only admins may operate on arbitrary user wallets
            if (!User.IsInRole("Admin")) return Forbid();

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
