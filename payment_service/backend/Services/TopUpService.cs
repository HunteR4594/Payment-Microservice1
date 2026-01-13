using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Services;

// This interface definition was missing in your last version
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
    private readonly PaymentDbContext _context;
    private readonly IWalletService _walletService;
    private readonly IPaymentProvider _paymentProvider;

    public TopUpService(PaymentDbContext context, IWalletService walletService, IPaymentProvider paymentProvider)
    {
        _context = context;
        _walletService = walletService;
        _paymentProvider = paymentProvider;
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

        var link = await _paymentProvider.CreatePaymentLinkAsync(topUp.Amount, "Wallet Top-up", topUp.Id);
        topUp.PaymentLinkId = link.Data?.Id;
        topUp.PaymentLinkUrl = link.Data?.Url;

        _context.TopUps.Add(topUp);
        await _context.SaveChangesAsync();
        return topUp;
    }

    public async Task<TopUp> CompleteTopUpAsync(string topUpId)
    {
        var topUp = await _context.TopUps.FindAsync(topUpId) ?? throw new Exception("Not found");
        if (topUp.Status != "pending") return topUp;

        topUp.Status = "completed";
        topUp.CompletedAt = DateTime.UtcNow;

        await _walletService.AddBalanceAsync(topUp.UserId, topUp.Amount, topUp.Id, $"Top-up via {topUp.PaymentMethod}");
        
        await _context.SaveChangesAsync();
        return topUp;
    }

    public async Task<TopUp?> GetTopUpAsync(string topUpId) => await _context.TopUps.FindAsync(topUpId);

    public async Task<List<TopUp>> GetTopUpsAsync(string userId, int limit = 10) => 
        await _context.TopUps.Where(t => t.UserId == userId).OrderByDescending(t => t.CreatedAt).Take(limit).ToListAsync();

    public async Task<TopUp> FailTopUpAsync(string topUpId)
    {
        var topUp = await _context.TopUps.FindAsync(topUpId) ?? throw new Exception("Not found");
        topUp.Status = "failed";
        await _context.SaveChangesAsync();
        return topUp;
    }
}
