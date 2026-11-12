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
    private readonly PosterFiles _posters;

    public MovieApiController(MovieService movies, PosterFiles posters)
    {
        _movies = movies;
        _posters = posters;
    }

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
    public async Task<IActionResult> Create(MovieRequest request)
    {
        var result = await _movies.CreateAsync(request.Title, request.StartDate, request.StopDate, request.Recommended);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message, movieId = result.Id });
    }

    [HttpPost("{id:int}/poster")]
    [Authorize(Roles = "Staff")]
    [RequestSizeLimit(PosterFiles.MaxBytes + (64 * 1024))]
    public async Task<IActionResult> Poster(int id, IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "กรุณาเลือกไฟล์รูป" });
        }

        var saved = await _posters.SaveAsync(file);
        if (saved.Error != null)
        {
            return BadRequest(new { message = saved.Error });
        }

        var (result, previous) = await _movies.SetPosterAsync(id, saved.FileName!);
        if (!result.Success)
        {
            _posters.Delete(saved.FileName);
            return BadRequest(new { message = result.Message });
        }

        _posters.Delete(previous);
        return Ok(new { message = result.Message, posterUrl = "/posters/" + saved.FileName });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> Update(int id, MovieRequest request) =>
        ApiResults.From(await _movies.UpdateAsync(id, request.Title, request.StartDate, request.StopDate, request.Recommended));

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
        movie.IsRecommended,
        Status = movie.Status.ToString(),
        posterUrl = movie.PosterFileName == null ? null : "/posters/" + movie.PosterFileName
    };
}
