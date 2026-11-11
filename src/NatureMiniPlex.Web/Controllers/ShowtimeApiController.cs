using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.DTOs;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

[ApiController]
[IgnoreAntiforgeryToken]
[Route("api/showtimes")]
public class ShowtimeApiController : ControllerBase
{
    private readonly ScheduleService _schedules;
    private readonly BookingService _bookings;

    public ShowtimeApiController(ScheduleService schedules, BookingService bookings)
    {
        _schedules = schedules;
        _bookings = bookings;
    }

    [HttpGet]
    public async Task<IActionResult> List(DateOnly? from, DateOnly? to, int? cinemaId, int? movieId, bool includeCancelled = false)
    {
        var start = from ?? AppClock.Today;
        var end = to ?? start.AddDays(6);
        return Ok(await _schedules.QueryAsync(start, end, cinemaId, movieId, includeCancelled));
    }

    [HttpGet("{id:int}/seats")]
    public async Task<IActionResult> Seats(int id)
    {
        var map = await _bookings.GetSeatMapAsync(id);
        if (map == null)
        {
            return NotFound(new { message = "ไม่พบรอบฉาย" });
        }

        return Ok(map);
    }

    [HttpPost]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Create(ShowtimeRequest request) =>
        ApiResults.From(await _schedules.CreateAsync(request.CinemaId, request.MovieId, request.ShowDate, request.Slot));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Update(int id, ShowtimeMovieRequest request) =>
        ApiResults.From(await _schedules.UpdateMovieAsync(id, request.MovieId));

    [HttpPost("{id:int}/cancel")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Cancel(int id) =>
        ApiResults.From(await _schedules.CancelOneAsync(id));

    [HttpPost("{id:int}/start")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Start(int id) =>
        ApiResults.From(await _schedules.ConfirmStartAsync(id));
}
