using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

public class ReportsController : Controller
{
    private readonly ReportService _reports;

    public ReportsController(ReportService reports) => _reports = reports;

    public async Task<IActionResult> Index(DateOnly? from, DateOnly? to, int? cinemaId, string? phone)
    {
        var start = from ?? AppClock.Today;
        var end = to ?? AppClock.Today.AddDays(7);
        return View(await _reports.BuildAsync(start, end, cinemaId, phone));
    }
}
