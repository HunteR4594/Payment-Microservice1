using System.ComponentModel.DataAnnotations.Schema;

namespace OrderService.Models
{
    public class OrderItem
    {
        public int order_item_id { get; set; }
        public int orders_id { get; set; }
        public int menu_item_id { get; set; }
        public int item_variant_id { get; set; }
        public string? item_name { get; set; }
        public string? item_description { get; set; }
        public string? variant_name { get; set; }
        public decimal variant_price { get; set; }
        public int quantity { get; set; }
        public string? special_instructions { get; set; }
        public decimal line_subtotal { get; set; }
        public virtual Orders? Order { get; set; }
    }
}