namespace OrderService.Models.DTO
{
    public class OrderDetailsDTO
    {
        public int orderId { get; set; }
        public byte status { get; set; }
        public bool cancellation_requested { get; set; } = false;
        public decimal subtotal { get; set; }
        public List<OrderItemDetailsDTO> items { get; set; } = new();
    }
}
