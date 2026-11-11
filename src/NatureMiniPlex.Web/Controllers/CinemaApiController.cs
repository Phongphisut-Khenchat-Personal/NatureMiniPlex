using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

[ApiController]
[IgnoreAntiforgeryToken]
[Route("api/cinemas")]
public class CinemaApiController : ControllerBase
{
    private readonly ScheduleService _schedules;

    public CinemaApiController(ScheduleService schedules) => _schedules = schedules;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _schedules.CinemaSummariesAsync());

    [HttpGet("{id:int}/seats")]
    public async Task<IActionResult> Seats(int id)
    {
        var page = await _schedules.SeatsAsync(id);
        if (page == null)
        {
            return NotFound(new { message = "ไม่พบโรงหนัง" });
        }

        return Ok(page);
    }
}
