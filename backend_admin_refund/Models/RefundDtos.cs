namespace backend_admin_refund.Models;

public class RefundRequestDto
{
    public string OrderId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class ReviewRefundDto
{
    public string Action { get; set; } = string.Empty; // "approve" or "reject"
    public string? AdminNotes { get; set; }
    public string? RejectionReason { get; set; }
    public string ReviewedBy { get; set; } = "Admin";
}

public class ContactCustomerDto
{
    public Guid RefundId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string ContactMethod { get; set; } = "email"; // "email" or "sms"
}
