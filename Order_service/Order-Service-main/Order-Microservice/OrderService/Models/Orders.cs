using System;
using System.Collections.Generic;

namespace OrderService.Models
{
    public class Orders
    {
        public int orders_id { get; set; }
        public int users_id { get; set; }
        public byte status { get; set; }
        public decimal subtotal { get; set; }
        public decimal total_cost { get; set; }
        public int item_count { get; set; }
        public DateTime placed_at { get; set; }
        public DateTime? fulfilled_at { get; set; }
        public string? payment_method { get; set; }
        public bool cancellation_requested { get; set; } = false;
        public string? cancellation_reason { get; set; }
        public int? payment_id { get; set; }
        public int? refund_status { get; set; }
        public virtual ICollection<OrderItem>? OrderItems { get; set; }
        public virtual ICollection<OrderFeedback>? OrderFeedbacks { get; set; }
    }
}