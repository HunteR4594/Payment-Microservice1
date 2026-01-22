namespace OrderService.Models.MenuServiceDTO
{
    public class MenuItemDTO
    {
        public int id {  get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string imageUrl { get; set; }
        public bool isAvailable { get; set; }
        public List<MenuItemVariantDTO> variants { get; set; } = new();
    }
}
