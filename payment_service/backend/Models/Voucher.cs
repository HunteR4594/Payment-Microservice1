namespace PaymentService.Models;

public class Voucher
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "percentage"; // percentage, fixed
    public decimal DiscountValue { get; set; }
    public decimal MinimumPurchase { get; set; }
    public decimal? MaxDiscount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;
    public int UsageLimit { get; set; }
    public int UsageCount { get; set; }
}

public class VoucherResponse
{
    public bool Success { get; set; }
    public Voucher? Data { get; set; }
    public string? Message { get; set; }
}

public class VoucherListResponse
{
    public bool Success { get; set; }
    public List<Voucher> Data { get; set; } = new();
    public int Total { get; set; }
}

public class ApplyVoucherRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}

public class ApplyVoucherResponse
{
    public bool Success { get; set; }
    public Voucher? Voucher { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string? Message { get; set; }
}
