using PaymentApi.Models;

namespace PaymentApi.Services;

public interface IWalletService
{
    Task<Wallet> GetWalletAsync(string userId);
    Task<Wallet> AddBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null);
    Task<Wallet> DeductBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null);
    Task<List<Transaction>> GetTransactionsAsync(string userId, int limit = 10);
}

public class MockWalletService : IWalletService
{
    private readonly Dictionary<string, Wallet> _wallets = new();
    private readonly List<Transaction> _transactions = new();

    public MockWalletService()
    {
        // Initialize with mock data
        _wallets["user_001"] = new Wallet
        {
            UserId = "user_001",
            Balance = 1500.00m,
            Coins = 250,
            LastUpdated = DateTime.UtcNow
        };

        // Add some mock transactions
        _transactions.AddRange(new[]
        {
            new Transaction
            {
                Id = "txn_001",
                UserId = "user_001",
                Type = "order",
                Amount = -150.00m,
                Description = "Order - Quezon City Branch",
                ReferenceId = "ord_001",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Transaction
            {
                Id = "txn_002",
                UserId = "user_001",
                Type = "topup",
                Amount = 500.00m,
                Description = "Top-up via GCash",
                ReferenceId = "top_001",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Transaction
            {
                Id = "txn_003",
                UserId = "user_001",
                Type = "order",
                Amount = -85.00m,
                Description = "Order - Makati Branch",
                ReferenceId = "ord_002",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new Transaction
            {
                Id = "txn_004",
                UserId = "user_001",
                Type = "topup",
                Amount = 1000.00m,
                Description = "Top-up via Maya",
                ReferenceId = "top_002",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            }
        });
    }

    public Task<Wallet> GetWalletAsync(string userId)
    {
        if (!_wallets.ContainsKey(userId))
        {
            _wallets[userId] = new Wallet
            {
                UserId = userId,
                Balance = 0,
                Coins = 0,
                LastUpdated = DateTime.UtcNow
            };
        }
        return Task.FromResult(_wallets[userId]);
    }

    public Task<Wallet> AddBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null)
    {
        var wallet = _wallets.GetValueOrDefault(userId) ?? new Wallet { UserId = userId };
        wallet.Balance += amount;
        wallet.Coins += (int)(amount / 100) * 5; // 5 coins per 100 pesos
        wallet.LastUpdated = DateTime.UtcNow;
        _wallets[userId] = wallet;

        _transactions.Add(new Transaction
        {
            Id = $"txn_{Guid.NewGuid():N}",
            UserId = userId,
            Type = "topup",
            Amount = amount,
            Description = description ?? "Wallet Top-up",
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        });

        return Task.FromResult(wallet);
    }

    public Task<Wallet> DeductBalanceAsync(string userId, decimal amount, string? referenceId = null, string? description = null)
    {
        var wallet = _wallets.GetValueOrDefault(userId);
        if (wallet == null || wallet.Balance < amount)
        {
            throw new InvalidOperationException("Insufficient balance");
        }

        wallet.Balance -= amount;
        wallet.LastUpdated = DateTime.UtcNow;

        _transactions.Add(new Transaction
        {
            Id = $"txn_{Guid.NewGuid():N}",
            UserId = userId,
            Type = "order",
            Amount = -amount,
            Description = description ?? "Order Payment",
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        });

        return Task.FromResult(wallet);
    }

    public Task<List<Transaction>> GetTransactionsAsync(string userId, int limit = 10)
    {
        var transactions = _transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToList();
        return Task.FromResult(transactions);
    }
}
