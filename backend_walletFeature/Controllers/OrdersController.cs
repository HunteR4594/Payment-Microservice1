using Microsoft.AspNetCore.Mvc;
using PaymentApi.Models;
using PaymentApi.Services;

namespace PaymentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

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
        [FromQuery] string userId = "user_001")
    {
        try
        {
            var order = await _orderService.CreateOrderAsync(userId, request);
            return Ok(new OrderResponse
            {
                Success = true,
                Data = order,
                Message = "Order placed successfully!"
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
        [FromQuery] string userId = "user_001",
        [FromQuery] int limit = 10)
    {
        var orders = await _orderService.GetOrdersAsync(userId, limit);
        return Ok(new OrderListResponse
        {
            Success = true,
            Data = orders,
            Total = orders.Count
        });
    }
}
