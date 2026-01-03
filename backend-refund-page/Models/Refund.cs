using System;

namespace backend_refund_page.Models
{
    public class Refund
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; } // e.g., Pending, Approved, Rejected
        public DateTime CreatedAt { get; set; }
    }
}