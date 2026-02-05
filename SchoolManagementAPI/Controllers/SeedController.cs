using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Data;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SeedController> _logger;

    public SeedController(ApplicationDbContext context, ILogger<SeedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> SeedDatabase()
    {
        try
        {
            await DatabaseSeeder.SeedAsync(_context);
            return Ok(new { message = "Database seeded successfully!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            return StatusCode(500, new { message = "Error seeding database", error = ex.Message });
        }
    }
}





