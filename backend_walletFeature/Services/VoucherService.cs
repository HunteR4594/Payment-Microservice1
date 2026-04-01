using PaymentApi.Models;

namespace PaymentApi.Services;

public interface IVoucherService
{
    Task<List<Voucher>> GetVouchersAsync();
    Task<Voucher?> GetVoucherByCodeAsync(string code);
    Task<ApplyVoucherResponse> ApplyVoucherAsync(ApplyVoucherRequest request);
}

public class MockVoucherService : IVoucherService
{
    private readonly List<Voucher> _vouchers;

    public MockVoucherService()
    {
        _vouchers = new List<Voucher>
        {
            new Voucher
            {
                Id = "vch_001",
                Code = "KAPE10",
                Description = "10% off on all orders",
                DiscountType = "percentage",
                DiscountValue = 10,
                MinimumPurchase = 100,
                MaxDiscount = 50,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidUntil = DateTime.UtcNow.AddDays(30),
                IsActive = true,
                UsageLimit = 100,
                UsageCount = 45
            },
            new Voucher
            {
                Id = "vch_002",
                Code = "NEWUSER50",
                Description = "₱50 off for new users",
                DiscountType = "fixed",
                DiscountValue = 50,
                MinimumPurchase = 150,
                MaxDiscount = null,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidUntil = DateTime.UtcNow.AddDays(60),
                IsActive = true,
                UsageLimit = 500,
                UsageCount = 123
            },
            new Voucher
            {
                Id = "vch_003",
                Code = "HOLIDAY25",
                Description = "25% off holiday special",
                DiscountType = "percentage",
                DiscountValue = 25,
                MinimumPurchase = 200,
                MaxDiscount = 100,
                ValidFrom = DateTime.UtcNow.AddDays(-5),
                ValidUntil = DateTime.UtcNow.AddDays(10),
                IsActive = true,
                UsageLimit = 200,
                UsageCount = 78
            },
            new Voucher
            {
                Id = "vch_004",
                Code = "FREESHIP",
                Description = "Free delivery on orders ₱300+",
                DiscountType = "fixed",
                DiscountValue = 49,
                MinimumPurchase = 300,
                MaxDiscount = null,
                ValidFrom = DateTime.UtcNow.AddDays(-60),
                ValidUntil = DateTime.UtcNow.AddDays(90),
                IsActive = true,
                UsageLimit = 1000,
                UsageCount = 456
            },
            new Voucher
            {
                Id = "vch_005",
                Code = "EXPIRED20",
                Description = "20% off (expired)",
                DiscountType = "percentage",
                DiscountValue = 20,
                MinimumPurchase = 100,
                MaxDiscount = 75,
                ValidFrom = DateTime.UtcNow.AddDays(-60),
                ValidUntil = DateTime.UtcNow.AddDays(-1), // Expired
                IsActive = false,
                UsageLimit = 100,
                UsageCount = 100
            }
        };
    }

    public Task<List<Voucher>> GetVouchersAsync()
    {
        var activeVouchers = _vouchers
            .Where(v => v.IsActive && v.ValidUntil > DateTime.UtcNow)
            .ToList();
        return Task.FromResult(activeVouchers);
    }

    public Task<Voucher?> GetVoucherByCodeAsync(string code)
    {
        var voucher = _vouchers.FirstOrDefault(v => 
            v.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(voucher);
    }

    public async Task<ApplyVoucherResponse> ApplyVoucherAsync(ApplyVoucherRequest request)
    {
        var voucher = await GetVoucherByCodeAsync(request.Code);

        if (voucher == null)
        {
            return new ApplyVoucherResponse
            {
                Success = false,
                Message = "Voucher code not found"
            };
        }

        if (!voucher.IsActive)
        {
            return new ApplyVoucherResponse
            {
                Success = false,
                Message = "This voucher is no longer active"
            };
        }

        if (DateTime.UtcNow < voucher.ValidFrom || DateTime.UtcNow > voucher.ValidUntil)
        {
            return new ApplyVoucherResponse
            {
                Success = false,
                Message = "This voucher has expired"
            };
        }

        if (voucher.UsageCount >= voucher.UsageLimit)
        {
            return new ApplyVoucherResponse
            {
                Success = false,
                Message = "This voucher has reached its usage limit"
            };
        }

        if (request.OrderAmount < voucher.MinimumPurchase)
        {
            return new ApplyVoucherResponse
            {
                Success = false,
                Message = $"Minimum purchase of ₱{voucher.MinimumPurchase:N2} required"
            };
        }

        // Calculate discount
        decimal discountAmount;
        if (voucher.DiscountType == "percentage")
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

        var finalAmount = request.OrderAmount - discountAmount;

        return new ApplyVoucherResponse
        {
            Success = true,
            Voucher = voucher,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            Message = $"Voucher applied! You saved ₱{discountAmount:N2}"
        };
    }
}
