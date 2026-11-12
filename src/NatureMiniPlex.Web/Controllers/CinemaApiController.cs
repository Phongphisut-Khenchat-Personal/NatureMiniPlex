using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.DTOs;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

[ApiController]
[IgnoreAntiforgeryToken]
[Route("api/cinemas")]
public class CinemaApiController : ControllerBase
{
    private readonly ScheduleService _schedules;
    private readonly CinemaService _cinemas;

    public CinemaApiController(ScheduleService schedules, CinemaService cinemas)
    {
        _schedules = schedules;
        _cinemas = cinemas;
    }

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _schedules.CinemaSummariesAsync());

    [HttpPost]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Create(CinemaRequest request)
    {
        var result = await _cinemas.CreateAsync(request.Name, request.Layout);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message, cinemaId = result.Id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Rename(int id, CinemaNameRequest request) =>
        ApiResults.From(await _cinemas.RenameAsync(id, request.Name));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Remove(int id) =>
        ApiResults.From(await _cinemas.RemoveAsync(id));

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

    [HttpPut("{id:int}/seats/{seatId:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> SetSeat(int id, int seatId, SeatClosedRequest request) =>
        ApiResults.From(await _cinemas.SetSeatClosedAsync(id, seatId, request.Closed));
}
