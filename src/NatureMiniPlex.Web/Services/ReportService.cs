using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.DTOs;
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
            .Where(seat => !seat.IsClosed)
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
                BookingCode = item.Booking.BookingCode,
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

    public async Task<DashboardView> DashboardAsync()
    {
        var today = AppClock.Today;
        var from = today.AddDays(-6);
        var booked = _db.BookingSeats.AsNoTracking().Where(item => item.Status == BookingSeatStatus.Booked);
        var dayRows = await booked
            .Where(item => item.Showtime.ShowDate >= from && item.Showtime.ShowDate <= today)
            .GroupBy(item => item.Showtime.ShowDate)
            .Select(group => new { Date = group.Key, Count = group.Count() })
            .ToListAsync();
        var cinemas = await _db.Cinemas.AsNoTracking().OrderBy(cinema => cinema.CinemaId).ToListAsync();
        var shares = new List<CinemaShare>();
        foreach (var cinema in cinemas)
        {
            shares.Add(new CinemaShare
            {
                CinemaName = cinema.CinemaName,
                BookedSeats = await booked.CountAsync(item => item.Showtime.ShowDate == today && item.Showtime.CinemaId == cinema.CinemaId),
                SeatCount = await _db.Seats.CountAsync(seat => seat.CinemaId == cinema.CinemaId),
                ShowsToday = await _db.Showtimes.CountAsync(show =>
                    show.CinemaId == cinema.CinemaId && show.ShowDate == today && show.Status != ShowtimeStatus.Cancelled)
            });
        }

        var recent = await _db.BookingSeats.AsNoTracking()
            .Include(item => item.Booking)
            .Include(item => item.Seat)
            .Include(item => item.Showtime).ThenInclude(show => show.Movie)
            .Include(item => item.Showtime).ThenInclude(show => show.Cinema)
            .OrderByDescending(item => item.BookingSeatId)
            .Take(8)
            .ToListAsync();

        return new DashboardView
        {
            Today = today,
            BookedSeatsToday = await booked.CountAsync(item => item.Showtime.ShowDate == today),
            PhonesToday = await booked.Where(item => item.Showtime.ShowDate == today).Select(item => item.Booking.PhoneNumber).Distinct().CountAsync(),
            CinemaCount = cinemas.Count,
            ShowsToday = await _db.Showtimes.CountAsync(show => show.ShowDate == today && show.Status != ShowtimeStatus.Cancelled),
            Days = Enumerable.Range(0, 7).Select(offset =>
            {
                var date = from.AddDays(offset);
                return new DayCount
                {
                    Date = date,
                    BookedSeats = dayRows.FirstOrDefault(row => row.Date == date)?.Count ?? 0
                };
            }).ToList(),
            Cinemas = shares,
            Recent = recent.Select(item => new RecentBooking
            {
                BookingCode = item.Booking.BookingCode,
                MovieTitle = item.Showtime.Movie.Title,
                CinemaName = item.Showtime.Cinema.CinemaName,
                SeatCode = item.Seat.SeatCode,
                ShowDate = item.Showtime.ShowDate,
                Slot = item.Showtime.Slot,
                Time = ShowSlotNames.Clock(item.Showtime.Slot),
                Status = StatusNames.BookingSeat(item.Status)
            }).ToList()
        };
    }
}
