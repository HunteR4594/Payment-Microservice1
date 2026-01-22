namespace MenuService.Model
{
    public class Menu
    {
        public int id { get; set; }
        public int variantId { get; set; }
        public string item_name { get; set; }
        public string item_description { get; set; }
        public string img_url { get; set; }
        public string variant_name { get; set; }
        public decimal variant_price { get; set; }
        public int quantity { get; set; }
        public decimal computed_subtotal { get; set; }
        public string specialInstructions { get; set; }
        public DateTime added_at { get; set; }
    }
}
