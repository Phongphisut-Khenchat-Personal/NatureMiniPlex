using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.DTOs;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

[ApiController]
[IgnoreAntiforgeryToken]
[Route("api/movies")]
public class MovieApiController : ControllerBase
{
    private readonly MovieService _movies;

    public MovieApiController(MovieService movies) => _movies = movies;

    [HttpGet]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> All() => Ok((await _movies.ListAsync()).Select(ToDto));

    [HttpGet("showing")]
    public async Task<IActionResult> Showing() => Ok((await _movies.ShowingAsync()).Select(ToDto));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> One(int id)
    {
        var movie = await _movies.FindAsync(id);
        if (movie == null)
        {
            return NotFound(new { message = "ไม่พบเรื่องหนัง" });
        }

        return Ok(ToDto(movie));
    }

    [HttpPost]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Create(MovieRequest request) =>
        ApiResults.From(await _movies.CreateAsync(request.Title, request.StartDate, request.StopDate));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Update(int id, MovieRequest request) =>
        ApiResults.From(await _movies.UpdateAsync(id, request.Title, request.StartDate, request.StopDate));

    [HttpPost("{id:int}/cancel")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Cancel(int id) =>
        ApiResults.From(await _movies.CancelAsync(id));

    private static object ToDto(Movie movie) => new
    {
        movie.MovieId,
        movie.Title,
        movie.StartDate,
        movie.StopDate,
        Status = movie.Status.ToString()
    };
}
