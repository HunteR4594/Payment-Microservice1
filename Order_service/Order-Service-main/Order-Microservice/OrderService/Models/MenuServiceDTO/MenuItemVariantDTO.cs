using Microsoft.EntityFrameworkCore.ValueGeneration;

namespace OrderService.Models.MenuServiceDTO
{
    public class MenuItemVariantDTO
    {
        public int id { get; set; } // menuItemVariantID
        public int variantId { get; set; } // Variant ID (Small/Medium/Large)
        public string variantName { get; set; }
        public decimal price { get; set; } = 0;
    }
}
