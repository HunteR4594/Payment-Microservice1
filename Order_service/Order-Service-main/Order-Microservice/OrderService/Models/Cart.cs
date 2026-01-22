namespace OrderService.Models
{
    public class Cart
    {
        public int cart_id { get; set; }
        public int users_id { get; set; }
        public decimal subtotal { get; set; }
        public DateTime updated_at { get; set; }

        // Navigation Property
        public ICollection<CartItem> CartItems { get; set; }
    }
}
