using System;

namespace backend_refund_page.Models
{
    public class Refund
    {
        public Guid Id { get; set; }
        public string PaymentId { get; set; } // PayMongo payment ID to refund
        public decimal Amount { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; } // e.g., Pending, Processing, Approved, Rejected, Failed
        public DateTime CreatedAt { get; set; }
        public string? PayMongoRefundId { get; set; } // PayMongo refund ID after processing
        public string? PhotoPath { get; set; } // Path to uploaded photo evidence
        public string? Notes { get; set; } // Additional notes or error messages
    }

    public class RefundRequest
    {
        public string PaymentId { get; set; } // PayMongo payment ID
        public decimal Amount { get; set; }
        public string Reason { get; set; }
        public string? Notes { get; set; }
    }

    public class PayMongoRefundResponse
    {
        public PayMongoRefundData Data { get; set; }
    }

    public class PayMongoRefundData
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public PayMongoRefundAttributes Attributes { get; set; }
    }

    public class PayMongoRefundAttributes
    {
        public long Amount { get; set; }
        public string Currency { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string PaymentId { get; set; }
    }
}