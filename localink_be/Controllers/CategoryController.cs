using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using localink_be.Data;
using localink_be.Services.Interfaces;

namespace localink_be.Controllers
{
    [ApiController]
    [Route("api/v1/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ICategoryService _service;

        public CategoryController(AppDbContext db, ICategoryService service)
        {
            _db = db;
            _service = service;
        }

        // GET: api/categories/db
        [HttpGet("db")]
        public async Task<IActionResult> GetCategoriesFromDb()
        {
            var categories = await _db.Categories.ToListAsync();
            return Ok(categories);
        }

        // GET: api/categories/{categoryId}/subcategories
        [HttpGet("{categoryId}/subcategories-db")]
        public async Task<IActionResult> GetSubcategories(int categoryId)
        {
            var subcategories = await _db.Subcategories
                .Where(s => s.CategoryId == categoryId)
                .ToListAsync();

            if (!subcategories.Any())
                return NotFound();

            return Ok(subcategories);
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetCategoriesAsync();
            return Ok(result);
        }
    }
}