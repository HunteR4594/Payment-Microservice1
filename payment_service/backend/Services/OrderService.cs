using PaymentService.Models;

namespace PaymentService.Services;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request);
    Task<Order?> GetOrderAsync(string orderId);
    Task<List<Order>> GetOrdersAsync(string userId, int limit = 10);
    Task<Order> CompleteOrderAsync(string orderId);
}

public class OrderService : IOrderService
{
    private readonly Dictionary<string, Order> _orders = new();
    private readonly IWalletService _walletService;
    private readonly IVoucherService _voucherService;
    private readonly IPaymentProvider _paymentProvider;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        IWalletService walletService, 
        IVoucherService voucherService,
        IPaymentProvider paymentProvider,
        ILogger<OrderService> logger)
    {
        _walletService = walletService;
        _voucherService = voucherService;
        _paymentProvider = paymentProvider;
        _logger = logger;

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
        var orderId = $"ord_{Guid.NewGuid():N}"[..12];
        var paymentMethod = request.PaymentMethod?.ToLower() ?? "wallet";

        // Handle payment based on method
        if (paymentMethod == "wallet")
        {
            // Wallet payment - deduct immediately
            var wallet = await _walletService.GetWalletAsync(userId);
            if (wallet.Balance < finalAmount)
            {
                throw new InvalidOperationException("Insufficient wallet balance");
            }

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
                DiscountAmount = discountAmount,
                PaymentMethod = "wallet"
            };

            _orders[order.Id] = order;
            return order;
        }
        else
        {
            // External payment (GCash, Maya, Card) - create PayMongo link
            var itemNames = string.Join(", ", request.Items.Select(i => $"{i.Quantity}x {i.Name}"));
            var description = $"Kapebara Order - {itemNames}";
            
            _logger.LogInformation("Creating PayMongo payment link for order {OrderId}, amount: {Amount}", orderId, finalAmount);
            
            var paymentLink = await _paymentProvider.CreatePaymentLinkAsync(finalAmount, description, orderId);

            var order = new Order
            {
                Id = orderId,
                UserId = userId,
                Amount = finalAmount,
                Branch = request.Branch,
                Items = request.Items,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                VoucherCode = request.VoucherCode,
                DiscountAmount = discountAmount,
                PaymentMethod = paymentMethod,
                PaymentLinkUrl = paymentLink.Data?.Url,
                PaymentLinkId = paymentLink.Data?.Id
            };

            _orders[order.Id] = order;
            _logger.LogInformation("Order {OrderId} created with checkout URL: {Url}", orderId, paymentLink.Data?.Url);
            return order;
        }
    }

    public async Task<Order> CompleteOrderAsync(string orderId)
    {
        if (!_orders.TryGetValue(orderId, out var order))
        {
            throw new InvalidOperationException("Order not found");
        }

        if (order.Status != "pending")
        {
            throw new InvalidOperationException($"Order is already {order.Status}");
        }

        order.Status = "completed";
        _logger.LogInformation("Order {OrderId} completed", orderId);
        return await Task.FromResult(order);
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
