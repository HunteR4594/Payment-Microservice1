using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.DTOs;
using OrderService.Models;
using OrderService.Models.DTO;
using OrderService.Services;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderStatusService _statusService;
        private readonly OrderDbContext _context;

        public OrdersController(OrderStatusService statusService, OrderDbContext context)
        {
            _statusService = statusService;
            _context = context;
        }

        // --- CUSTOMER METHODS ---

        [HttpPost("request-cancellation")]
        public async Task<IActionResult> RequestCancellation([FromBody] CancellationRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { message = "spill the tea, bestie! we need a reason to cancel. ☕" });

            try
            {
                var result = await _statusService.RequestCancellationAsync(request.OrderId, request.Reason);

                if (result.Contains("submitted"))
                    return Ok(new { message = result });

                return BadRequest(new { message = result });
            } catch (Exception ex)
            {
                return StatusCode(500, new {message = ex.Message});
            }
        }


        [HttpPost("place/order/{userId}")]
        public async Task<IActionResult> PlaceOrder(
               int userId
           )
        {
            var order = await _statusService.PlaceOrderAsync(userId);

            if (order == null)
            {
                return BadRequest(new { message = "Cart is empty or not found." });
            }

            return Ok(order);
        }


        [HttpGet("{orderId}/items")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            
            // Fetch the Order
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.orders_id == orderId);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            // Map to DTO
            var orderDto = new OrderDetailsDTO
            {
                orderId = order.orders_id,
                subtotal = order.total_cost,
                status = order.status,
                cancellation_requested = order.cancellation_requested,
                items = order.OrderItems?.Select(oi => new OrderItemDetailsDTO
                {
                    imageUrl = null,
                    name = oi.item_name,
                    quantity = oi.quantity,
                    size = oi.variant_name,
                    total = oi.line_subtotal,
                    specialInstructions = oi.special_instructions
                }).ToList() ?? new List<OrderItemDetailsDTO>()
            };

            return Ok(order);
        }






        [HttpPatch("status")]
        public async Task<IActionResult> UpdateStatus([FromBody] OrderStatusDto request)
        {
            if (request == null) return BadRequest(new { message = "Body is empty" });

            string role = request.UserRole?.ToLower() ?? "customer";
            if (role == "string") role = "customer";
            request.UserRole = role;

            var result = await _statusService.UpdateStatusAsync(request);
            if (result.Contains("success") || result.Contains("submitted")) return Ok(new { message = result });
            return BadRequest(new { message = result });
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetOrderHistory(
            int userId,
            [FromQuery] string filter = "all", // options: all, ongoing, completed, cancelled
            [FromQuery] string sortOrder = "newest") // options: newest, oldest
        {
            var query = _context.Orders.Where(o => o.users_id == userId).AsQueryable();
            return await ApplyFiltersAndReturn(query, filter, sortOrder);
        }

        // --- ADMIN METHODS ---

        [HttpGet("admin/history")]
        public async Task<IActionResult> GetAdminOrderHistory(
            [FromQuery] string filter = "all",
            [FromQuery] string sortOrder = "newest")
        {
            // Admin version: start with all orders across all users
            var query = _context.Orders.AsQueryable();
            return await ApplyFiltersAndReturn(query, filter, sortOrder);
        }

        [HttpGet("admin/pending-cancellations")]
        public async Task<IActionResult> GetPendingCancellations()
        {
            var pending = await _context.Orders
                .Where(o => o.cancellation_requested)
                .Select(o => new {
                    o.orders_id,
                    o.users_id,
                    o.cancellation_reason,
                    o.item_count,
                    Status = ((OrderStatus)o.status).ToString(),
                    o.total_cost,
                    o.placed_at
                }).ToListAsync();

            if (!pending.Any()) return Ok(new { message = "No pending drama! The vibes are immaculate. ✨" });
            return Ok(pending);
        }

        [HttpPost("admin/review-cancellation")]
        public async Task<IActionResult> ReviewCancellation([FromBody] AdminCancellationReviewDto review)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.orders_id == review.OrderId);
            if (order == null) return NotFound(new { message = "Order not found" });

            if (review.Approve)
            {
                var dto = new OrderStatusDto
                {
                    OrderId = review.OrderId,
                    NewStatus = OrderStatus.Cancelled,
                    UserRole = "admin"
                };
                await _statusService.UpdateStatusAsync(dto);
                return Ok(new { message = "Cancellation approved! Refund in progress." });
            }

            order.cancellation_requested = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Request declined! The kitchen is still cooking." });
        }

        // --- SHARED HELPER LOGIC ---

        private async Task<IActionResult> ApplyFiltersAndReturn(IQueryable<Orders> query, string filter, string sortOrder)
        {
            // 1. Apply Status Filters
            switch (filter.ToLower())
            {
                case "ongoing":
                    query = query.Where(o => o.status >= 1 && o.status <= 4);
                    break;
                case "completed":
                    query = query.Where(o => o.status == 5);
                    break;
                case "cancelled":
                    query = query.Where(o => o.status == 7);
                    break;
            }

            // 2. Handle Date Sorting
            if (sortOrder.ToLower() == "oldest")
                query = query.OrderBy(o => o.placed_at);
            else
                query = query.OrderByDescending(o => o.placed_at);

            var ordersList = await query.ToListAsync();

            // 3. Map to Result
            var resultList = ordersList.Select(o => new {
                o.orders_id,
                o.users_id, // Useful for admin to see who placed the order
                o.total_cost,
                o.placed_at,
                o.fulfilled_at,
                o.item_count,
                StatusValue = o.status,
                StatusName = ((OrderStatus)o.status).ToString(),
                o.payment_method,
                o.cancellation_requested,
                o.cancellation_reason
            });

            if (!resultList.Any())
                return Ok(new { message = $"No {filter} orders found here! " });

            return Ok(resultList);
        }
    }
}