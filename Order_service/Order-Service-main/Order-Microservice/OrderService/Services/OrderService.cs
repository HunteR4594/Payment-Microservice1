using OrderService.Models;
using OrderService.Data;
using Microsoft.EntityFrameworkCore;

namespace OrderService.Services
{
    public class OrderStatusService
    {
        private readonly OrderDbContext _context;

        public OrderStatusService(OrderDbContext context)
        {
            _context = context;
        }

        // 🔘 CUSTOMER SIDE
        public async Task<string> RequestCancellationAsync(int orderId, string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
                return "um, you can't leave us on read! a reason is REQUIRED to request a cancellation.";

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.orders_id == orderId);
            if (order == null) return "order not found ";

            if (order.cancellation_requested)
                return "chill bestie! you already requested a cancellation for this order. the admin is working on it! ";

            if (order.status > (byte)OrderStatus.Preparing)
                return $"too late bestie! order is already {(OrderStatus)order.status}. you can't cancel now!";

            order.cancellation_requested = true;
            order.cancellation_reason = reason;

            await _context.SaveChangesAsync();
            return "cancellation request submitted! wait for the admin to vibe check it.";
        }


        public async Task<Orders?> PlaceOrderAsync(int userId)
        {
            var cart = await _context.Cart
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.users_id == userId);

            if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
            {
                return null;
            }

            var order = new Orders
            {
                users_id = userId,
                status = 1,
                subtotal = cart.subtotal,
                total_cost = cart.subtotal,
                item_count = cart.CartItems.Sum(i => i.quantity),
                placed_at = DateTime.UtcNow,
                fulfilled_at = null,
                payment_method = "Unpaid",
                cancellation_requested = false,
                cancellation_reason = "None",
                payment_id = null,
                refund_status = 0 // Important because this is needed to be shown when creating the Order Data in database.
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var orderItems = cart.CartItems.Select(ci => new OrderItem
            {
                orders_id = order.orders_id,
                menu_item_id = ci.menu_item_id,
                item_variant_id = ci.variant_id,
                item_name = ci.item_name,
                item_description = ci.item_description,
                variant_name = ci.variant_name,
                variant_price = ci.variant_price,
                quantity = ci.quantity,
                line_subtotal = ci.variant_price * ci.quantity
            }).ToList();

            _context.OrderItem.AddRange(orderItems);

            _context.CartItem.RemoveRange(cart.CartItems);
            cart.subtotal = 0;
            cart.updated_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return order;
        }




        // 💎 ADMIN/RIDER SIDE
        public async Task<string> UpdateStatusAsync(OrderStatusDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.orders_id == dto.OrderId);
            if (order == null) return $"order {dto.OrderId} not found.";

            string role = dto.UserRole?.ToLower() ?? "customer";
            if (role == "string") role = "customer";

            switch (dto.NewStatus)
            {
                case OrderStatus.Preparing:
                case OrderStatus.ReadyForPickup:
                    if (role != "admin") return "security!! only admins can prep! ";
                    break;
                case OrderStatus.InTransit:
                case OrderStatus.Delivered:
                case OrderStatus.Failed:
                    if (role != "rider") return "halt!! only riders can deliver!";
                    break;
                case OrderStatus.Cancelled:
                    if (role != "admin") return "only admins can officially confirm a cancellation.";

                    // logic update: check if the customer actually requested this 
                    if (!order.cancellation_requested)
                    {
                        // if requested = 0, it means the kitchen is ending it
                        order.cancellation_reason = "The kitchen cancelled your order.";
                    }
                    // if it was already requested, we keep the reason the customer gave us

                    order.cancellation_requested = false;
                    order.refund_status = 1; // Pending 
                    break;
            }

            if ((int)dto.NewStatus < (int)order.status)
                return $"u can't go backwards! already at {(OrderStatus)order.status}.";

            order.status = (byte)dto.NewStatus;

            if (dto.NewStatus == OrderStatus.Delivered || dto.NewStatus == OrderStatus.Cancelled || dto.NewStatus == OrderStatus.Failed)
                order.fulfilled_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return $"success! order {dto.OrderId} moved to {dto.NewStatus} ✨";
        }
    }
}