using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

public class SchedulesController : Controller
{
    private readonly ScheduleService _schedules;
    private readonly MovieService _movies;

    public SchedulesController(ScheduleService schedules, MovieService movies)
    {
        _schedules = schedules;
        _movies = movies;
    }

    public async Task<IActionResult> Index(DateOnly? from, DateOnly? to)
    {
        var start = from ?? AppClock.Today;
        var end = to ?? AppClock.Today.AddDays(7);
        ViewBag.From = start;
        ViewBag.To = end;
        ViewBag.Cinemas = await _schedules.CinemasAsync();
        return View(await _schedules.ListAsync(start, end));
    }

    public async Task<IActionResult> Edit(int cinemaId, DateOnly date)
    {
        var day = await _schedules.GetDayAsync(cinemaId, date);
        if (day == null)
        {
            return NotFound();
        }

        day.Movies = await _movies.ActiveOnAsync(date);
        return View(day);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(int cinemaId, DateOnly showDate, int movieId, ShowSlot[]? slots)
    {
        var result = await _schedules.SaveDayAsync(cinemaId, showDate, movieId, slots ?? []);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Edit), new { cinemaId, date = showDate.ToString("yyyy-MM-dd") });
    }

    [HttpPost]
    public async Task<IActionResult> CancelDay(int cinemaId, DateOnly showDate)
    {
        var result = await _schedules.CancelDayAsync(cinemaId, showDate);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Start(int id)
    {
        var result = await _schedules.ConfirmStartAsync(id);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Index));
    }
}
