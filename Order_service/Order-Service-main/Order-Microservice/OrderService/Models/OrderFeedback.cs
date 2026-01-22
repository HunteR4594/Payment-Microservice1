using Microsoft.EntityFrameworkCore;

namespace OrderService.Models
{
    public class OrderFeedback
    {
        public int order_feedback_id { get; set; }
        public int orders_id { get; set; }
        public int rating { get; set; }
        public string comment { get; set; }
        public DateTime created_at { get; set; }
        public bool is_read { get; set; }

        // Navigation Property
        public Orders Order { get; set; }
    }
}
