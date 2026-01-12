using PaymentService.Models;

namespace PaymentService.Services;

public interface ITopUpService
{
    Task<TopUp> CreateTopUpAsync(string userId, TopUpRequest request);
    Task<TopUp?> GetTopUpAsync(string topUpId);
    Task<List<TopUp>> GetTopUpsAsync(string userId, int limit = 10);
    Task<TopUp> CompleteTopUpAsync(string topUpId);
    Task<TopUp> FailTopUpAsync(string topUpId);
}

public class TopUpService : ITopUpService
{
    private readonly Dictionary<string, TopUp> _topUps = new();
    private readonly IWalletService _walletService;
    private readonly IPaymentProvider _paymentProvider;
    private readonly ILogger<TopUpService> _logger;

    public TopUpService(IWalletService walletService, IPaymentProvider paymentProvider, ILogger<TopUpService> logger)
    {
        _walletService = walletService;
        _paymentProvider = paymentProvider;
        _logger = logger;

        // Add mock top-up history
        var mockTopUps = new[]
        {
            new TopUp
            {
                Id = "top_001",
                UserId = "user_001",
                Amount = 500.00m,
                PaymentMethod = "gcash",
                Status = "completed",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                CompletedAt = DateTime.UtcNow.AddDays(-5),
                ReferenceNumber = "GCASH-12345"
            },
            new TopUp
            {
                Id = "top_002",
                UserId = "user_001",
                Amount = 1000.00m,
                PaymentMethod = "maya",
                Status = "completed",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                CompletedAt = DateTime.UtcNow.AddDays(-10),
                ReferenceNumber = "MAYA-67890"
            }
        };

        foreach (var topUp in mockTopUps)
        {
            _topUps[topUp.Id] = topUp;
        }
    }

    public async Task<TopUp> CreateTopUpAsync(string userId, TopUpRequest request)
    {
        var topUp = new TopUp
        {
            Id = $"top_{Guid.NewGuid():N}"[..12],
            UserId = userId,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            ReferenceNumber = $"{request.PaymentMethod.ToUpper()}-{DateTime.UtcNow.Ticks % 100000}"
        };

        try
        {
            // Create payment link using configured provider
            var paymentLinkResponse = await _paymentProvider.CreatePaymentLinkAsync(
                topUp.Amount,
                $"Kapebara Wallet Top-up - ₱{topUp.Amount:N2}",
                topUp.Id
            );

            if (paymentLinkResponse.Success && paymentLinkResponse.Data != null)
            {
                topUp.PaymentLinkId = paymentLinkResponse.Data.Id;
                topUp.PaymentLinkUrl = paymentLinkResponse.Data.Url;
                _logger.LogInformation($"[{_paymentProvider.ProviderName}] Created payment link for top-up {topUp.Id}: {topUp.PaymentLinkUrl}");
            }
            else
            {
                _logger.LogWarning($"[{_paymentProvider.ProviderName}] Failed to create link: {paymentLinkResponse.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"[{_paymentProvider.ProviderName}] Error creating payment link: {ex.Message}");
        }

        _topUps[topUp.Id] = topUp;
        return topUp;
    }

    public Task<TopUp?> GetTopUpAsync(string topUpId)
    {
        _topUps.TryGetValue(topUpId, out var topUp);
        return Task.FromResult(topUp);
    }

    public Task<List<TopUp>> GetTopUpsAsync(string userId, int limit = 10)
    {
        var topUps = _topUps.Values
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToList();
        return Task.FromResult(topUps);
    }

    public async Task<TopUp> CompleteTopUpAsync(string topUpId)
    {
        if (!_topUps.TryGetValue(topUpId, out var topUp))
        {
            throw new InvalidOperationException("Top-up not found");
        }

        if (topUp.Status != "pending")
        {
            throw new InvalidOperationException("Top-up is not pending");
        }

        topUp.Status = "completed";
        topUp.CompletedAt = DateTime.UtcNow;

        // Add balance to wallet with reference to this top-up
        var paymentMethodName = topUp.PaymentMethod switch
        {
            "gcash" => "GCash",
            "maya" => "Maya",
            "card" => "Credit/Debit Card",
            _ => topUp.PaymentMethod
        };
        await _walletService.AddBalanceAsync(
            topUp.UserId, 
            topUp.Amount, 
            topUp.Id,
            $"Top-up via {paymentMethodName}"
        );

        return topUp;
    }

    public Task<TopUp> FailTopUpAsync(string topUpId)
    {
        if (!_topUps.TryGetValue(topUpId, out var topUp))
        {
            throw new InvalidOperationException("Top-up not found");
        }

        topUp.Status = "failed";
        return Task.FromResult(topUp);
    }
}
