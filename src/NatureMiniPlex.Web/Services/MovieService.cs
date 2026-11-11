using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Services;

public class MovieService
{
    private readonly AppDbContext _db;

    public MovieService(AppDbContext db) => _db = db;

    public Task<List<Movie>> ListAsync() =>
        _db.Movies
            .OrderBy(movie => movie.Status)
            .ThenBy(movie => movie.StartDate)
            .ThenBy(movie => movie.Title)
            .ToListAsync();

    public Task<Movie?> FindAsync(int movieId) =>
        _db.Movies.FirstOrDefaultAsync(movie => movie.MovieId == movieId);

    public Task<List<Movie>> ActiveOnAsync(DateOnly date) =>
        _db.Movies
            .Where(movie => movie.Status == MovieStatus.Active && movie.StartDate <= date && movie.StopDate >= date)
            .OrderBy(movie => movie.Title)
            .ToListAsync();

    public async Task<RuleResult> CreateAsync(string title, DateOnly startDate, DateOnly stopDate)
    {
        var error = Validate(title, startDate, stopDate);
        if (error != null)
        {
            return RuleResult.Fail(error);
        }

        _db.Movies.Add(new Movie
        {
            Title = title.Trim(),
            StartDate = startDate,
            StopDate = stopDate,
            Status = MovieStatus.Active
        });
        await _db.SaveChangesAsync();
        return RuleResult.Ok("เพิ่มเรื่องหนังแล้ว");
    }

    public async Task<RuleResult> UpdateAsync(int movieId, string title, DateOnly startDate, DateOnly stopDate)
    {
        var movie = await FindAsync(movieId);
        if (movie == null || movie.Status != MovieStatus.Active)
        {
            return RuleResult.Fail("ไม่พบเรื่องหนัง หรือเรื่องนี้ถูกยกเลิกแล้ว");
        }

        var error = Validate(title, startDate, stopDate);
        if (error != null)
        {
            return RuleResult.Fail(error);
        }

        var outside = await _db.Showtimes.AnyAsync(show =>
            show.MovieId == movieId &&
            show.Status != ShowtimeStatus.Cancelled &&
            (show.ShowDate < startDate || show.ShowDate > stopDate));
        if (outside)
        {
            return RuleResult.Fail("มีรอบฉายที่อยู่นอกช่วงวันที่ใหม่ กรุณาแก้รอบฉายก่อน");
        }

        movie.Title = title.Trim();
        movie.StartDate = startDate;
        movie.StopDate = stopDate;
        await _db.SaveChangesAsync();
        return RuleResult.Ok("แก้ไขเรื่องหนังแล้ว");
    }

    public async Task<RuleResult> CancelAsync(int movieId)
    {
        var movie = await _db.Movies
            .Include(item => item.Showtimes)
            .ThenInclude(show => show.BookingSeats)
            .FirstOrDefaultAsync(item => item.MovieId == movieId);
        if (movie == null || movie.Status != MovieStatus.Active)
        {
            return RuleResult.Fail("ไม่พบเรื่องหนัง หรือเรื่องนี้ถูกยกเลิกแล้ว");
        }

        var today = AppClock.Today;
        var futureShows = movie.Showtimes
            .Where(show => show.Status != ShowtimeStatus.Cancelled && show.ShowDate >= today)
            .ToList();
        if (futureShows.Any(show =>
                show.Status == ShowtimeStatus.Started ||
                show.BookingSeats.Any(seat => seat.Status == BookingSeatStatus.Booked)))
        {
            return RuleResult.Fail("ยกเลิกเรื่องไม่ได้ เพราะมีรอบของวันนี้หรือวันหน้าถูกจองหรือเริ่มฉายแล้ว");
        }

        foreach (var show in futureShows)
        {
            show.Status = ShowtimeStatus.Cancelled;
        }

        movie.Status = MovieStatus.Cancelled;
        await _db.SaveChangesAsync();
        return RuleResult.Ok("ยกเลิกเรื่องหนังแล้ว");
    }

    public static string? Validate(string title, DateOnly startDate, DateOnly stopDate)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return "กรุณาระบุชื่อเรื่อง";
        }

        if (title.Trim().Length > 200)
        {
            return "ชื่อเรื่องยาวเกิน 200 ตัวอักษร";
        }

        if (stopDate < startDate)
        {
            return "วันสิ้นสุดต้องไม่ก่อนวันเริ่มฉาย";
        }

        return null;
    }
}
