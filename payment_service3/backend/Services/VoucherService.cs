using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Services;

public interface IVoucherService
{
    Task<List<Voucher>> GetVouchersAsync();
    Task<Voucher?> GetVoucherByCodeAsync(string code);
    Task<ApplyVoucherResponse> ApplyVoucherAsync(ApplyVoucherRequest request);
    Task<bool> UpdateVoucherUsageAsync(string code);
}

public class VoucherService : IVoucherService
{
    private readonly PaymentDbContext _context;
    private readonly ILogger<VoucherService> _logger;

    public VoucherService(PaymentDbContext context, ILogger<VoucherService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Voucher>> GetVouchersAsync()
    {
        return await _context.Vouchers
            .Where(v => v.IsActive && v.ValidUntil > DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task<Voucher?> GetVoucherByCodeAsync(string code)
    {
    if (string.IsNullOrWhiteSpace(code)) return null;
    
    // Use Trim() and ToLower() for maximum compatibility
    var cleanCode = code.Trim().ToLower(); 
    return await _context.Vouchers
        .FirstOrDefaultAsync(v => v.Code.ToLower() == cleanCode);
    }

    public async Task<ApplyVoucherResponse> ApplyVoucherAsync(ApplyVoucherRequest request)
    {
        var voucher = await GetVoucherByCodeAsync(request.Code);

        if (voucher == null)
        {
            return new ApplyVoucherResponse { Success = false, Message = "Voucher code not found" };
        }

        if (!voucher.IsActive)
        {
            return new ApplyVoucherResponse { Success = false, Message = "This voucher is no longer active" };
        }

        if (DateTime.UtcNow < voucher.ValidFrom || DateTime.UtcNow > voucher.ValidUntil)
        {
            return new ApplyVoucherResponse { Success = false, Message = "This voucher has expired" };
        }

        if (voucher.UsageCount >= voucher.UsageLimit)
        {
            return new ApplyVoucherResponse { Success = false, Message = "This voucher has reached its usage limit" };
        }

        if (request.OrderAmount < voucher.MinimumPurchase)
        {
            return new ApplyVoucherResponse 
            { 
                Success = false, 
                Message = $"Minimum purchase of ₱{voucher.MinimumPurchase:N2} required" 
            };
        }

        decimal discountAmount;
        if (voucher.DiscountType.Equals("percentage", StringComparison.OrdinalIgnoreCase))
        {
            discountAmount = request.OrderAmount * (voucher.DiscountValue / 100);
            if (voucher.MaxDiscount.HasValue && discountAmount > voucher.MaxDiscount.Value)
            {
                discountAmount = voucher.MaxDiscount.Value;
            }
        }
        else 
        {
            discountAmount = voucher.DiscountValue;
        }

        discountAmount = Math.Min(discountAmount, request.OrderAmount);

        return new ApplyVoucherResponse
        {
            Success = true,
            Voucher = voucher,
            DiscountAmount = discountAmount,
            FinalAmount = request.OrderAmount - discountAmount,
            Message = $"Voucher applied! You saved ₱{discountAmount:N2}"
        };
    }

    public async Task<bool> UpdateVoucherUsageAsync(string code)
    {
        var voucher = await _context.Vouchers
            .FirstOrDefaultAsync(v => v.Code.Trim().ToUpper() == code.Trim().ToUpper());

        if (voucher == null) return false;

        voucher.UsageCount++; 
        await _context.SaveChangesAsync(); 
        return true;
    }
}
