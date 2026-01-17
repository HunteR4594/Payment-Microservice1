using Microsoft.AspNetCore.Mvc;
using PaymentService.Models;
using PaymentService.Services;


namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    // NOTE (Mock Order Service):
    // This controller is intentionally DB-backed and is the DEFAULT order source while a real Order Service
    // does not exist yet. When an external Order Service is introduced, you can either:
    // 1) switch the frontend to call the /api/order-integration/* proxy endpoints (enabled via OrderService:Enabled), or
    // 2) refactor IOrderService to proxy to the external Order Service instead of the local DB.
    private readonly IOrderService _orderService;

    private string ResolveUserId(string? userId)
    {
        if (!string.IsNullOrWhiteSpace(userId)) return userId;
        if (Request.Headers.TryGetValue("X-User-Id", out var headerUserId) && !string.IsNullOrWhiteSpace(headerUserId))
        {
            return headerUserId.ToString();
        }
        return "user_001";
    }

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Create a new order
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(
        [FromBody] CreateOrderRequest request,
        [FromQuery] string? userId = null)
    {
        try
        {
            var resolvedUserId = ResolveUserId(userId);
            var order = await _orderService.CreateOrderAsync(resolvedUserId, request);
            return Ok(new OrderResponse
            {
                Success = true,
                Data = order,
                Message = "Order created successfully"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new OrderResponse
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{orderId}")]
    public async Task<ActionResult<OrderResponse>> GetOrder(string orderId)
    {
        var order = await _orderService.GetOrderAsync(orderId);
        if (order == null)
        {
            return NotFound(new OrderResponse
            {
                Success = false,
                Message = "Order not found"
            });
        }

        return Ok(new OrderResponse
        {
            Success = true,
            Data = order
        });
    }

    /// <summary>
    /// Get all orders for a user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<OrderListResponse>> GetOrders(
        [FromQuery] string? userId = null,
        [FromQuery] int limit = 10)
    {
        var resolvedUserId = ResolveUserId(userId);
        var orders = await _orderService.GetOrdersAsync(resolvedUserId, limit);
        return Ok(new OrderListResponse
        {
            Success = true,
            Data = orders,
            Total = orders.Count
        });
    }

    /// <summary>
    /// Complete a pending order (after payment)
    /// </summary>
    [HttpPost("{orderId}/complete")]
    public async Task<ActionResult<OrderResponse>> CompleteOrder(string orderId)
    {
        try
        {
            var order = await _orderService.CompleteOrderAsync(orderId);
            return Ok(new OrderResponse
            {
                Success = true,
                Data = order,
                Message = "Order completed successfully"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new OrderResponse
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}
