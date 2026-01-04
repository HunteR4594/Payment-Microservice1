namespace PaymentApi.Models;

public class Order
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = "user_001";
    public decimal Amount { get; set; }
    public string Branch { get; set; } = string.Empty;
    public List<OrderItem> Items { get; set; } = new();
    public string Status { get; set; } = "completed"; // pending, completed, cancelled
    public DateTime CreatedAt { get; set; }
    public string? VoucherCode { get; set; }
    public decimal DiscountAmount { get; set; }
}

public class OrderItem
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class OrderResponse
{
    public bool Success { get; set; }
    public Order? Data { get; set; }
    public string? Message { get; set; }
}

public class OrderListResponse
{
    public bool Success { get; set; }
    public List<Order> Data { get; set; } = new();
    public int Total { get; set; }
}

public class CreateOrderRequest
{
    public List<OrderItem> Items { get; set; } = new();
    public string Branch { get; set; } = string.Empty;
    public string? VoucherCode { get; set; }
}
