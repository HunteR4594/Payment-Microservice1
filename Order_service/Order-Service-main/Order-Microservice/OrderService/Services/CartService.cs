using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.OpenApi.Models;
using OrderService.Data;
using OrderService.Models;
using OrderService.Models.DTO;
using OrderService.Models.MenuServiceDTO;

namespace OrderService.Services
{
    public class CartService
    {
        private readonly OrderDbContext _db;
        private readonly HttpClient _menuClient;

        public CartService(OrderDbContext db, IHttpClientFactory httpFactory)
        {
            _db = db;
            _menuClient = httpFactory.CreateClient("MenuService");
        }
        

        public async Task<Cart> AddItem (
                int menuId,
                //int variantId,
                int userId
            )
        {

            // Get the menu item information
            // Get /menu/item/{id}
            var menuItem = await _menuClient.GetFromJsonAsync<MenuDTO>($"/api/Menu/{menuId}");

            // ------------------------------
            // Get the menu item with the variants. (This is to be made when this is switched to the mono repo)
            /*
            var item = await _menuClient.GetFromJsonAsync<MenuItemDTO>($"/api/menu-items/{menuId}");

            if (item == null)
            {
                throw new Exception("Invalid item");
            }

            var variant = item.variants
                .FirstOrDefault(v => v.variantId == variantId);

            if (variant == null)
            {
                throw new Exception("Invalid variant");
            }
            */
            // ------------------------------

            // Add it to the cart/cart items
            if (menuItem == null)
                throw new Exception("Item does not exist.");

            // Get user's cart or create user's cart
            var cart = await _db.Cart
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.users_id == userId);

            if (cart == null)
            {
                cart = new Cart { users_id = userId, subtotal = 0, CartItems = new List<CartItem>() };
                _db.Cart.Add(cart);
            }

            // If item exists in cart then increment quantity
            var existingItem = cart.CartItems.FirstOrDefault(i =>
                i.menu_item_id == menuId
                && i.variant_id == menuItem.variantId
            );

            if (existingItem != null)
            {
                existingItem.quantity += menuItem.quantity;
            } else
            {
                cart.CartItems.Add(new CartItem
                {
                    menu_item_id = menuId,
                    variant_id = menuItem.variantId,
                    item_name = menuItem.item_name,
                    item_description = menuItem.item_description,
                    img_url = menuItem.img_url,
                    variant_name = menuItem.variant_name,
                    variant_price = menuItem.variant_price,
                    quantity = menuItem.quantity,
                    computed_subtotal = menuItem.variant_price * menuItem.quantity,
                    special_instructions = menuItem.specialInstructions,
                    added_at = DateTime.Now
                });
            }

            // Recompute cart subtotal
            cart.subtotal = cart.CartItems.Sum(i => i.variant_price * i.quantity);

            await _db.SaveChangesAsync();
            return cart;
        }

        public async Task<CartDTO?> ViewCart(int userId)
        {
            var cart = await _db.Cart
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.users_id == userId);

            if (cart == null)
            {
                return null;
            }

            return new CartDTO
            {
                cart_id = cart.cart_id,
                users_id = cart.users_id,
                subtotal = cart.subtotal,
                updated_at = cart.updated_at,
                cartItems = cart.CartItems.Select(item => new CartItemDTO
                {
                    cart_item_id = item.cart_item_id,
                    item_name = item.item_name,
                    variant_name = item.variant_name,
                    variant_price = item.variant_price,
                    quantity = item.quantity,
                    img_url = item.img_url
                }).ToList()
            };
        }

        public async Task<List<CartItemDTO>> ViewCartItems(int userId)
        {
            return await _db.Cart
                .Where(c => c.users_id == userId)
                .SelectMany(c => c.CartItems)
                .Select(item => new CartItemDTO
                {
                    cart_item_id = item.cart_item_id,
                    item_name = item.item_name,
                    variant_name = item.variant_name,
                    variant_price = item.variant_price,
                    quantity = item.quantity,
                    img_url = item.img_url
                })
                .ToListAsync();
        }

        public async Task<Cart?> RemoveItem(int userID, int cartItemID, int quantityToRemove)
        {
            var cart = await _db.Cart
                 .Include(c => c.CartItems)
                 .FirstOrDefaultAsync(c => c.users_id == userID);

            if (cart == null)
            {
                return null;
            }

            var cartItem = cart.CartItems
                .FirstOrDefault(ci => ci.cart_item_id == cartItemID);

            if (cartItem == null)
            {
                return null;
            }

            // Decrease Quantity
            cartItem.quantity -= quantityToRemove;

            if (cartItem.quantity <= 0)
            {
                _db.CartItem.Remove(cartItem);
            } else
            {
                cartItem.computed_subtotal = cartItem.quantity * cartItem.variant_price;
            }

            // Recalculate cart subtotal
            cart.subtotal = cart.CartItems
                .Where(ci => ci.cart_item_id != cartItemID || cartItem.quantity > 0)
                .Sum(ci => ci.quantity * ci.variant_price);

            cart.updated_at = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return cart;
        }


        public async Task<Cart?> IncreaseItem(int userID, int cartItemID, int count)
        {
            var cart = await _db.Cart
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.users_id == userID);

            if (cart == null)
            {
                return null;
            }

            var cartItem = cart.CartItems
                .FirstOrDefault(ci => ci.cart_item_id == cartItemID);

            if (cartItem == null)
            {
                return null;
            }

            cartItem.quantity += count;

            cartItem.computed_subtotal = cartItem.quantity * cartItem.variant_price;

            cart.subtotal = cart.CartItems
                .Sum(ci => ci.quantity * ci.variant_price);

            cart.updated_at = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return cart;
        }

    }
}
