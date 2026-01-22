using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Services;

namespace OrderService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeneralController : ControllerBase
    {
        private readonly OrderDbContext _db;


        public GeneralController(OrderDbContext db)
        {
            _db = db;
        }

        // GET /api/carts
        [HttpGet("carts")]
        public async Task<IActionResult> GetAllCarts()
        {
            var carts = await _db.Cart.ToListAsync();
            return Ok(carts);
        }

        // GET /api/cartitems
        [HttpGet("cartitems")]
        public async Task<IActionResult> GetAllCartItems()
        {
            var items = await _db.CartItem.ToListAsync();
            return Ok(items);
        }

        // GET /api/orders
        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _db.Orders.ToListAsync();
            return Ok(orders);
        }

        // GET /api/orderitems
        [HttpGet("orderitems")]
        public async Task<IActionResult> GetAllOrderItems()
        {
            var items = await _db.OrderItem.ToListAsync();
            return Ok(items);
        }

        // GET /api/cart via ID
        [HttpGet("cart/{id}")]
        public async Task<IActionResult> GetCartById(int id)
        {
            var cart = await _db.Cart.FindAsync(id);
            if (cart == null) return NotFound();
            return Ok(cart);
        }

        // GET /api/cartitem via ID
        [HttpGet("cartitem/{id}")]
        public async Task<IActionResult> GetCartItemById(int id)
        {
            var item = await _db.CartItem.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // GET /api/orders via ID
        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        // GET /api/orderitem via ID
        [HttpGet("orderitem/{id}")]
        public async Task<IActionResult> GetOrderItemById(int id)
        {
            var item = await _db.OrderItem.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }
    }
}
