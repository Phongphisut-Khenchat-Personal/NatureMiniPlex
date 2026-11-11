using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

public class MoviesController : Controller
{
    private readonly MovieService _movies;

    public MoviesController(MovieService movies) => _movies = movies;

    public async Task<IActionResult> Index() => View(await _movies.ListAsync());

    public IActionResult Create()
    {
        var today = AppClock.Today;
        return View("Form", new MovieForm { StartDate = today, StopDate = today });
    }

    [HttpPost]
    public async Task<IActionResult> Create(MovieForm form)
    {
        var result = await _movies.CreateAsync(form.Title, form.StartDate, form.StopDate);
        if (!result.Success)
        {
            ModelState.AddModelError(string.Empty, result.Message);
            return View("Form", form);
        }

        TempData["Success"] = result.Message;
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(int id)
    {
        var movie = await _movies.FindAsync(id);
        if (movie == null || movie.Status != MovieStatus.Active)
        {
            return NotFound();
        }

        return View("Form", new MovieForm
        {
            MovieId = movie.MovieId,
            Title = movie.Title,
            StartDate = movie.StartDate,
            StopDate = movie.StopDate
        });
    }

    [HttpPost]
    public async Task<IActionResult> Edit(MovieForm form)
    {
        var result = await _movies.UpdateAsync(form.MovieId, form.Title, form.StartDate, form.StopDate);
        if (!result.Success)
        {
            ModelState.AddModelError(string.Empty, result.Message);
            return View("Form", form);
        }

        TempData["Success"] = result.Message;
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Cancel(int id)
    {
        var result = await _movies.CancelAsync(id);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Index));
    }
}
