using PaymentApi.Models;

namespace PaymentApi.Services;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request);
    Task<Order?> GetOrderAsync(string orderId);
    Task<List<Order>> GetOrdersAsync(string userId, int limit = 10);
}

public class MockOrderService : IOrderService
{
    private readonly Dictionary<string, Order> _orders = new();
    private readonly IWalletService _walletService;
    private readonly IVoucherService _voucherService;

    public MockOrderService(IWalletService walletService, IVoucherService voucherService)
    {
        _walletService = walletService;
        _voucherService = voucherService;

        // Add mock order history
        var mockOrders = new[]
        {
            new Order
            {
                Id = "ord_001",
                UserId = "user_001",
                Amount = 150.00m,
                Branch = "Quezon City Branch",
                Items = new List<OrderItem>
                {
                    new() { Name = "Iced Kapebara Latte", Quantity = 2, Price = 55.00m },
                    new() { Name = "Caramel Macchiato", Quantity = 1, Price = 40.00m }
                },
                Status = "completed",
                CreatedAt = DateTime.UtcNow.AddDays(-3).AddHours(6).AddMinutes(5),
                DiscountAmount = 0
            },
            new Order
            {
                Id = "ord_002",
                UserId = "user_001",
                Amount = 85.00m,
                Branch = "Makati Branch",
                Items = new List<OrderItem>
                {
                    new() { Name = "Hot Americano", Quantity = 1, Price = 45.00m },
                    new() { Name = "Chocolate Croissant", Quantity = 1, Price = 40.00m }
                },
                Status = "completed",
                CreatedAt = DateTime.UtcNow.AddDays(-7).AddHours(14).AddMinutes(30),
                DiscountAmount = 0
            },
            new Order
            {
                Id = "ord_003",
                UserId = "user_001",
                Amount = 225.00m,
                Branch = "BGC Branch",
                Items = new List<OrderItem>
                {
                    new() { Name = "Kapebara Special", Quantity = 3, Price = 75.00m }
                },
                Status = "completed",
                CreatedAt = DateTime.UtcNow.AddDays(-14).AddHours(9).AddMinutes(15),
                VoucherCode = "KAPE10",
                DiscountAmount = 25.00m
            }
        };

        foreach (var order in mockOrders)
        {
            _orders[order.Id] = order;
        }
    }

    public async Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request)
    {
        var subtotal = request.Items.Sum(i => i.Price * i.Quantity);
        decimal discountAmount = 0;

        // Apply voucher if provided
        if (!string.IsNullOrEmpty(request.VoucherCode))
        {
            var voucherResult = await _voucherService.ApplyVoucherAsync(new ApplyVoucherRequest
            {
                Code = request.VoucherCode,
                OrderAmount = subtotal
            });

            if (voucherResult.Success)
            {
                discountAmount = voucherResult.DiscountAmount;
            }
        }

        var finalAmount = subtotal - discountAmount;

        // Check wallet balance
        var wallet = await _walletService.GetWalletAsync(userId);
        if (wallet.Balance < finalAmount)
        {
            throw new InvalidOperationException("Insufficient wallet balance");
        }

        var orderId = $"ord_{Guid.NewGuid():N}"[..12];

        // Deduct from wallet with order reference
        await _walletService.DeductBalanceAsync(
            userId, 
            finalAmount, 
            orderId,
            $"Order - {request.Branch}"
        );

        var order = new Order
        {
            Id = orderId,
            UserId = userId,
            Amount = finalAmount,
            Branch = request.Branch,
            Items = request.Items,
            Status = "completed",
            CreatedAt = DateTime.UtcNow,
            VoucherCode = request.VoucherCode,
            DiscountAmount = discountAmount
        };

        _orders[order.Id] = order;
        return order;
    }

    public Task<Order?> GetOrderAsync(string orderId)
    {
        _orders.TryGetValue(orderId, out var order);
        return Task.FromResult(order);
    }

    public Task<List<Order>> GetOrdersAsync(string userId, int limit = 10)
    {
        var orders = _orders.Values
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(limit)
            .ToList();
        return Task.FromResult(orders);
    }
}
