namespace PaymentService.Domain.DTOs;

public class CreatePaymentRequest
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "PHP";
    public required string Description { get; set; }
    public required string PaymentMethod { get; set; } // e.g., "gcash", "card"
}
