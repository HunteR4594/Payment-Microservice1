using MenuService.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly MenuDbContext _db;
        public MenuController(MenuDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.Menus.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var i = await _db.Menus.FindAsync(id);
            if (i == null) return NotFound();
            return Ok(i);
        }


    }
}
