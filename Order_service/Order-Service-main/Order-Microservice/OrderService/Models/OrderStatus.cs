namespace OrderService.Models
{
    public enum OrderStatus : byte
    {
        Placed = 1,
        Preparing = 2,
        ReadyForPickup = 3,
        InTransit = 4,
        Delivered = 5,
        Failed = 6,
        Cancelled = 7
    }
}