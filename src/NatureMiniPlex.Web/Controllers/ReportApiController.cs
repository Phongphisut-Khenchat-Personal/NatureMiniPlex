using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

[ApiController]
[IgnoreAntiforgeryToken]
[Authorize(Roles = "Staff")]
[Route("api")]
public class ReportApiController : ControllerBase
{
    private readonly ReportService _reports;

    public ReportApiController(ReportService reports) => _reports = reports;

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard() => Ok(await _reports.DashboardAsync());

    [HttpGet("reports")]
    public async Task<IActionResult> Reports(DateOnly? from, DateOnly? to, int? cinemaId, string? phone)
    {
        var start = from ?? AppClock.Today;
        var end = to ?? start;
        var page = await _reports.BuildAsync(start, end, cinemaId, phone);
        return Ok(new
        {
            page.From,
            page.To,
            page.CinemaId,
            page.Phone,
            page.GeneratedAt,
            cinemas = page.Cinemas.Select(cinema => new { cinema.CinemaId, cinema.CinemaName }),
            page.Shows,
            page.Movies,
            page.Bookings
        });
    }
}
