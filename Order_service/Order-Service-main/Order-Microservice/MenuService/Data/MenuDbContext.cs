using Microsoft.EntityFrameworkCore;
using MenuService.Model;

namespace MenuService.Data
{
    public class MenuDbContext : DbContext
    {
        public MenuDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Menu> Menus { get; set; }
    }
}
