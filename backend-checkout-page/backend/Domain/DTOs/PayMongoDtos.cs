namespace PaymentService.Domain.DTOs;

public class PaymentMethodListResponse
{
    public required List<PaymentMethodData> data { get; set; }
}

public class PaymentMethodData
{
    public required string id { get; set; }
    public required string type { get; set; }
    public required PaymentMethodAttributes attributes { get; set; }
}

public class PaymentMethodAttributes
{
    public required string type { get; set; } // e.g., "gcash", "card"
    public required string name { get; set; } // e.g., "GCash"
}