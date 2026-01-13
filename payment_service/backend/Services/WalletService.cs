using Microsoft.EntityFrameworkCore; // Required for EF extensions
using PaymentService.Data;           // Required to find PaymentDbContext
using PaymentService.Models;

namespace PaymentService.Services;

public interface IWalletService
{
    Task<Wallet> GetWalletAsync(string userId);
    Task<Wallet> AddBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null);
    Task<Wallet> DeductBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null);
    Task<List<Transaction>> GetTransactionsAsync(string userId, int limit = 10);
}

public class WalletService : IWalletService
{
    private readonly PaymentDbContext _context;

    public WalletService(PaymentDbContext context)
    {
        _context = context;
    }

    public async Task<Wallet> GetWalletAsync(string userId)
    {
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        
        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0,
                Coins = 0,
                LastUpdated = DateTime.UtcNow
            };
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();
        }
        return wallet;
    }

    public async Task<Wallet> AddBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null)
    {
        var wallet = await GetWalletAsync(userId);
        wallet.Balance += amount;
        wallet.Coins += (int)(amount / 100) * 5; 
        wallet.LastUpdated = DateTime.UtcNow;

        _context.Transactions.Add(new Transaction
        {
            Id = $"txn_{Guid.NewGuid():N}",
            UserId = userId,
            Type = "topup",
            Amount = amount,
            Description = description ?? "Wallet Top-up",
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return wallet;
    }

    public async Task<Wallet> DeductBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null)
    {
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.Balance < amount)
        {
            throw new InvalidOperationException("Insufficient balance");
        }

        wallet.Balance -= amount;
        wallet.LastUpdated = DateTime.UtcNow;

        _context.Transactions.Add(new Transaction
        {
            Id = $"txn_{Guid.NewGuid():N}",
            UserId = userId,
            Type = "order",
            Amount = -amount,
            Description = description ?? "Order Payment",
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return wallet;
    }

    public async Task<List<Transaction>> GetTransactionsAsync(string userId, int limit = 10)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }
}
