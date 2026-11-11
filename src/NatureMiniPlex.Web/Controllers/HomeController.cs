using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

public class HomeController : Controller
{
    private readonly ReportService _reports;
    private readonly ScheduleService _schedules;

    public HomeController(ReportService reports, ScheduleService schedules)
    {
        _reports = reports;
        _schedules = schedules;
    }

    public async Task<IActionResult> Index()
    {
        var today = AppClock.Today;
        var report = await _reports.BuildAsync(today, today, null, null);
        ViewBag.Cinemas = await _schedules.CinemasAsync();
        return View(report);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
