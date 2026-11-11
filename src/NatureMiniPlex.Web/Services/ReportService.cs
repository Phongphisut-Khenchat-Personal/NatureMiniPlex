using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Services;

public class ReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db) => _db = db;

    public async Task<ReportPage> BuildAsync(DateOnly from, DateOnly to, int? cinemaId, string? phone)
    {
        if (to < from)
        {
            to = from;
        }

        var showsQuery = _db.Showtimes
            .AsNoTracking()
            .Include(show => show.Cinema)
            .Include(show => show.Movie)
            .Where(show => show.Status != ShowtimeStatus.Cancelled && show.ShowDate >= from && show.ShowDate <= to);
        if (cinemaId != null)
        {
            showsQuery = showsQuery.Where(show => show.CinemaId == cinemaId);
        }

        var shows = await showsQuery
            .OrderBy(show => show.ShowDate)
            .ThenBy(show => show.CinemaId)
            .ThenBy(show => show.Slot)
            .ToListAsync();
        var showIds = shows.Select(show => show.ShowtimeId).ToList();

        var bookedCounts = await _db.BookingSeats.AsNoTracking()
            .Where(item => item.Status == BookingSeatStatus.Booked && showIds.Contains(item.ShowtimeId))
            .GroupBy(item => item.ShowtimeId)
            .Select(group => new { group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Key, item => item.Count);
        var seatCounts = await _db.Seats.AsNoTracking()
            .GroupBy(seat => seat.CinemaId)
            .Select(group => new { group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Key, item => item.Count);

        var showRows = shows.Select(show => new ShowReportRow
        {
            ShowtimeId = show.ShowtimeId,
            CinemaName = show.Cinema.CinemaName,
            MovieTitle = show.Movie.Title,
            ShowDate = show.ShowDate,
            Slot = show.Slot,
            Status = show.Status,
            SeatCount = seatCounts.GetValueOrDefault(show.CinemaId),
            BookedCount = bookedCounts.GetValueOrDefault(show.ShowtimeId)
        }).ToList();

        var movieRows = showRows
            .GroupBy(row => row.MovieTitle)
            .Select(group => new MovieReportRow
            {
                Title = group.Key,
                BookedSeats = group.Sum(row => row.BookedCount)
            })
            .OrderByDescending(row => row.BookedSeats)
            .ThenBy(row => row.Title)
            .ToList();

        var bookingQuery = _db.BookingSeats.AsNoTracking()
            .Include(item => item.Booking)
            .Include(item => item.Showtime).ThenInclude(show => show.Cinema)
            .Include(item => item.Showtime).ThenInclude(show => show.Movie)
            .Include(item => item.Seat)
            .Where(item => item.Showtime.ShowDate >= from && item.Showtime.ShowDate <= to);
        if (cinemaId != null)
        {
            bookingQuery = bookingQuery.Where(item => item.Showtime.CinemaId == cinemaId);
        }

        var normalized = PhoneNumber.Normalize(phone);
        if (normalized != null)
        {
            bookingQuery = bookingQuery.Where(item => item.Booking.PhoneNumber == normalized);
        }
        else
        {
            bookingQuery = bookingQuery.Where(item => item.Status == BookingSeatStatus.Booked);
        }

        var bookingRows = await bookingQuery
            .OrderBy(item => item.Showtime.ShowDate)
            .ThenBy(item => item.Showtime.Slot)
            .ThenBy(item => item.Seat.SeatCode)
            .Select(item => new BookingReportRow
            {
                PhoneNumber = item.Booking.PhoneNumber,
                CinemaName = item.Showtime.Cinema.CinemaName,
                MovieTitle = item.Showtime.Movie.Title,
                ShowDate = item.Showtime.ShowDate,
                Slot = item.Showtime.Slot,
                SeatCode = item.Seat.SeatCode,
                Status = item.Status,
                BookedAt = item.Booking.BookedAt
            })
            .ToListAsync();

        return new ReportPage
        {
            From = from,
            To = to,
            CinemaId = cinemaId,
            Phone = phone?.Trim() ?? "",
            Cinemas = await _db.Cinemas.AsNoTracking().OrderBy(cinema => cinema.CinemaId).ToListAsync(),
            Shows = showRows,
            Movies = movieRows,
            Bookings = bookingRows,
            GeneratedAt = DateTime.Now
        };
    }
}
