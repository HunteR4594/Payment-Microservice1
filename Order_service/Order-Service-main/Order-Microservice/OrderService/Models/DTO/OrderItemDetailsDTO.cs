namespace OrderService.Models.DTO
{
    public class OrderItemDetailsDTO
    {
        public string? imageUrl { get; set; }      // From Menu Service
        public string? name { get; set; }       // item_name
        public int quantity { get; set; }       // quantity
        public string? size { get; set; }       // variant_name
        public decimal total { get; set; }      // line_subtotal
        public string? specialInstructions { get; set; }      // special_instructions
    }
}
