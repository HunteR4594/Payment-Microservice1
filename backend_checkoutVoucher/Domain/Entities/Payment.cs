namespace PaymentService.Domain.Entities;

public class Payment
{
    public Guid PaymentId { get; set; }
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "PHP";
    public required string Status { get; set; } // Pending, Paid, Failed
    public required string PaymentMethod { get; set; } // gcash, card, paymaya
    public string? ProviderTransactionId { get; set; } // ID from PayMongo
    public DateTime CreatedAt { get; set; }
}
