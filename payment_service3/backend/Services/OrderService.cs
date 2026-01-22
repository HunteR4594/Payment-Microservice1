using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Services;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request);
    Task<Order?> GetOrderAsync(string orderId);
    Task<List<Order>> GetOrdersAsync(string userId, int limit = 10);
    Task<Order> CompleteOrderAsync(string orderId);
    Task<Order> PayOrderAsync(string userId, string orderId, PayOrderRequest request);
}

public class OrderService : IOrderService
{
    private readonly PaymentDbContext _context;
    private readonly IWalletService _walletService;
    private readonly IVoucherService _voucherService;
    private readonly IPaymentProvider _paymentProvider;

    public OrderService(PaymentDbContext context, IWalletService walletService, IVoucherService voucherService, IPaymentProvider paymentProvider)
    {
        _context = context;
        _walletService = walletService;
        _voucherService = voucherService;
        _paymentProvider = paymentProvider;
    }

    public async Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request)
    {
        var subtotal = request.Items.Sum(i => i.Price * i.Quantity);
        decimal discountAmount = 0;

        if (!string.IsNullOrEmpty(request.VoucherCode))
        {
            var vResult = await _voucherService.ApplyVoucherAsync(new ApplyVoucherRequest { Code = request.VoucherCode, OrderAmount = subtotal });
            if (vResult.Success) 
            {
                discountAmount = vResult.DiscountAmount;
                // MUST HAVE 'await' HERE
                await _voucherService.UpdateVoucherUsageAsync(request.VoucherCode);
            }
        }

        var finalAmount = subtotal - discountAmount;
        var orderId = $"ord_{Guid.NewGuid():N}"[..12];
        var paymentMethod = request.PaymentMethod?.ToLower() ?? "wallet";

        if (request.CoinsToUse > 0)
        {
            var coinsToApply = (int)Math.Min(request.CoinsToUse, Math.Ceiling(finalAmount));
            if (coinsToApply > 0)
            {
                await _walletService.UseCoinsAsync(userId, coinsToApply, orderId, $"Coins used for order {orderId}");
                discountAmount += coinsToApply;
                finalAmount -= coinsToApply;
            }
        }

        var order = new Order
        {
            Id = orderId,
            UserId = userId,
            Amount = finalAmount,
            Branch = request.Branch,
            Items = request.Items,
            Status = paymentMethod == "wallet" ? "completed" : "pending",
            CreatedAt = DateTime.UtcNow,
            VoucherCode = request.VoucherCode,
            DiscountAmount = discountAmount,
            PaymentMethod = paymentMethod
        };

        if (paymentMethod == "wallet")
        {
            await _walletService.DeductBalanceAsync(userId, finalAmount, orderId, $"Order - {request.Branch}");
        }
        else
        {
            var paymentLink = await _paymentProvider.CreatePaymentLinkAsync(finalAmount, $"Order {orderId}", orderId);
            order.PaymentLinkUrl = paymentLink.Data?.Url;
            order.PaymentLinkId = paymentLink.Data?.Id;
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> GetOrderAsync(string orderId) => await _context.Orders.FindAsync(orderId);

    public async Task<List<Order>> GetOrdersAsync(string userId, int limit = 10)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<Order> CompleteOrderAsync(string orderId)
    {
        var order = await _context.Orders.FindAsync(orderId) ?? throw new Exception("Order not found");
        order.Status = "completed";
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order> PayOrderAsync(string userId, string orderId, PayOrderRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
        {
            throw new InvalidOperationException("Order not found");
        }

        if (!string.Equals(order.UserId, userId, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Order does not belong to the current user");
        }

        if (!string.Equals(order.Status, "pending", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Order is not pending (current: {order.Status})");
        }

        var subtotal = (order.Items ?? new List<OrderItem>()).Sum(i => i.Price * i.Quantity);
        decimal discountAmount = 0;

        if (!string.IsNullOrEmpty(request.VoucherCode))
        {
            var vResult = await _voucherService.ApplyVoucherAsync(new ApplyVoucherRequest
            {
                Code = request.VoucherCode,
                OrderAmount = subtotal,
            });
            if (vResult.Success)
            {
                discountAmount = vResult.DiscountAmount;
                await _voucherService.UpdateVoucherUsageAsync(request.VoucherCode);
            }
        }

        var finalAmount = subtotal - discountAmount;

        if (request.CoinsToUse > 0)
        {
            var coinsToApply = (int)Math.Min(request.CoinsToUse, Math.Ceiling(finalAmount));
            if (coinsToApply > 0)
            {
                await _walletService.UseCoinsAsync(userId, coinsToApply, order.Id, $"Coins used for order {order.Id}");
                discountAmount += coinsToApply;
                finalAmount -= coinsToApply;
            }
        }

        var paymentMethod = request.PaymentMethod?.ToLower() ?? "wallet";
        order.PaymentMethod = paymentMethod;
        order.VoucherCode = request.VoucherCode;
        order.DiscountAmount = discountAmount;
        order.Amount = finalAmount;

        if (paymentMethod == "wallet")
        {
            await _walletService.DeductBalanceAsync(userId, finalAmount, order.Id, $"Order - {order.Branch}");
            order.Status = "completed";
            order.PaymentLinkUrl = null;
            order.PaymentLinkId = null;
        }
        else
        {
            var paymentLink = await _paymentProvider.CreatePaymentLinkAsync(finalAmount, $"Order {order.Id}", order.Id);
            order.PaymentLinkUrl = paymentLink.Data?.Url;
            order.PaymentLinkId = paymentLink.Data?.Id;
            order.Status = "pending";
        }

        await _context.SaveChangesAsync();
        return order;
    }
}