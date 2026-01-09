namespace backend_admin_refund.Models;

public class RefundRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // "Wrong Order", "Quality Issue", "Late Delivery", "Other"
    public RefundStatus Status { get; set; } = RefundStatus.Pending;
    public string? AdminNotes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
}

public enum RefundStatus
{
    Pending,
    UnderReview,
    Approved,
    Rejected,
    Completed
}
