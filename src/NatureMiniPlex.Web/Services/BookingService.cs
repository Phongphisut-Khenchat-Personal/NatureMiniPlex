using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Services;

public record SeatPick(int ShowtimeId, int SeatId);

public class BookingService
{
    private readonly AppDbContext _db;

    public BookingService(AppDbContext db) => _db = db;

    public Task<List<Showtime>> OpenShowtimesAsync()
    {
        var today = AppClock.Today;
        return _db.Showtimes
            .Include(show => show.Cinema)
            .Include(show => show.Movie)
            .Where(show => show.Status == ShowtimeStatus.Open && show.ShowDate >= today)
            .OrderBy(show => show.ShowDate)
            .ThenBy(show => show.CinemaId)
            .ThenBy(show => show.Slot)
            .ToListAsync();
    }

    public async Task<SeatMapView?> GetSeatMapAsync(int showtimeId, IReadOnlyCollection<CartLine> cart)
    {
        var show = await _db.Showtimes
            .Include(item => item.Cinema)
            .ThenInclude(cinema => cinema.Seats)
            .Include(item => item.Movie)
            .FirstOrDefaultAsync(item => item.ShowtimeId == showtimeId);
        if (show == null)
        {
            return null;
        }

        var bookedIds = await _db.BookingSeats
            .Where(item => item.ShowtimeId == showtimeId && item.Status == BookingSeatStatus.Booked)
            .Select(item => item.SeatId)
            .ToListAsync();
        var cartIds = cart.Where(line => line.ShowtimeId == showtimeId).Select(line => line.SeatId).ToHashSet();

        var closed = show.Status != ShowtimeStatus.Open || show.ShowDate < AppClock.Today;
        var reason = show.Status == ShowtimeStatus.Started
            ? "รอบนี้เริ่มฉายแล้ว จึงจองไม่ได้"
            : show.ShowDate < AppClock.Today
                ? "เลยวันฉายแล้ว จึงจองไม่ได้"
                : show.Status == ShowtimeStatus.Cancelled
                    ? "รอบนี้ถูกยกเลิกแล้ว"
                    : "";

        return new SeatMapView
        {
            ShowtimeId = show.ShowtimeId,
            CinemaName = show.Cinema.CinemaName,
            MovieTitle = show.Movie.Title,
            ShowDate = show.ShowDate,
            Slot = show.Slot,
            ColumnCount = show.Cinema.ColumnCount,
            Closed = closed,
            ClosedReason = reason,
            Seats = SeatLayout.InDisplayOrder(show.Cinema.Seats).Select(seat => new SeatCell
            {
                SeatId = seat.SeatId,
                SeatRow = seat.SeatRow,
                SeatColumn = seat.SeatColumn,
                SeatCode = seat.SeatCode,
                Booked = bookedIds.Contains(seat.SeatId),
                InCart = cartIds.Contains(seat.SeatId)
            }).ToList()
        };
    }

    public async Task<List<CancelSeatRow>> SeatsForPhoneAsync(string? phone)
    {
        var normalized = PhoneNumber.Normalize(phone);
        if (normalized == null)
        {
            return [];
        }

        var items = await _db.BookingSeats
            .Include(item => item.Showtime).ThenInclude(show => show.Cinema)
            .Include(item => item.Showtime).ThenInclude(show => show.Movie)
            .Include(item => item.Seat)
            .Where(item => item.Booking.PhoneNumber == normalized && item.Status == BookingSeatStatus.Booked)
            .OrderBy(item => item.Showtime.ShowDate)
            .ThenBy(item => item.Showtime.Slot)
            .ThenBy(item => item.Seat.SeatCode)
            .ToListAsync();

        var today = AppClock.Today;
        return items.Select(item =>
        {
            var open = item.Showtime.Status == ShowtimeStatus.Open && item.Showtime.ShowDate >= today;
            var reason = item.Showtime.Status == ShowtimeStatus.Started
                ? "เริ่มฉายแล้ว"
                : item.Showtime.ShowDate < today
                    ? "เลยวันฉายแล้ว"
                    : "";
            return new CancelSeatRow
            {
                BookingSeatId = item.BookingSeatId,
                CinemaName = item.Showtime.Cinema.CinemaName,
                MovieTitle = item.Showtime.Movie.Title,
                ShowDate = item.Showtime.ShowDate,
                Slot = item.Showtime.Slot,
                SeatCode = item.Seat.SeatCode,
                CanCancel = open,
                Reason = reason
            };
        }).ToList();
    }

    public async Task<RuleResult> BookAsync(string? phone, IReadOnlyList<SeatPick> picks)
    {
        var normalized = PhoneNumber.Normalize(phone);
        if (normalized == null)
        {
            return RuleResult.Fail("กรุณากรอกเบอร์โทร 10 หลัก ขึ้นต้นด้วย 0");
        }

        var distinct = picks.Distinct().ToList();
        if (distinct.Count is < 1 or > 4)
        {
            return RuleResult.Fail("จองได้ 1 ถึง 4 ที่นั่งต่อการจอง");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var result = await BookInsideAsync(normalized, distinct);
            if (!result.Success)
            {
                await transaction.RollbackAsync();
                return result;
            }

            await transaction.CommitAsync();
            return result;
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            return RuleResult.Fail("มีที่นั่งถูกจองไปแล้ว กรุณาเลือกที่นั่งใหม่");
        }
    }

    public async Task<RuleResult> CancelAsync(string? phone, IReadOnlyCollection<int> bookingSeatIds)
    {
        var normalized = PhoneNumber.Normalize(phone);
        if (normalized == null)
        {
            return RuleResult.Fail("เบอร์โทรไม่ถูกต้อง");
        }

        var ids = bookingSeatIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return RuleResult.Fail("กรุณาเลือกที่นั่งที่จะยกเลิก");
        }

        var items = await _db.BookingSeats
            .Include(item => item.Booking)
            .Include(item => item.Showtime)
            .Where(item => ids.Contains(item.BookingSeatId))
            .ToListAsync();
        if (items.Count != ids.Count)
        {
            return RuleResult.Fail("ไม่พบรายการจองที่เลือก");
        }

        // เทียบเบอร์จากแถวในฐานข้อมูล เปลี่ยนเลขที่นั่งบนหน้าเว็บอย่างเดียวจึงยกเลิกของคนอื่นไม่ได้
        if (items.Any(item => item.Booking.PhoneNumber != normalized))
        {
            return RuleResult.Fail("ยกเลิกได้เฉพาะที่นั่งที่จองด้วยเบอร์นี้");
        }

        if (items.Any(item => item.Status != BookingSeatStatus.Booked))
        {
            return RuleResult.Fail("มีที่นั่งที่ยกเลิกไปแล้ว");
        }

        var today = AppClock.Today;
        if (items.Any(item => item.Showtime.Status != ShowtimeStatus.Open || item.Showtime.ShowDate < today))
        {
            return RuleResult.Fail("รอบนี้เริ่มฉายแล้ว หรือเลยวันฉาย จึงยกเลิกไม่ได้");
        }

        var now = DateTime.Now;
        foreach (var item in items)
        {
            item.Status = BookingSeatStatus.Cancelled;
            item.CancelledAt = now;
        }

        await _db.SaveChangesAsync();
        return RuleResult.Ok("ยกเลิกการจองแล้ว");
    }

    private async Task<RuleResult> BookInsideAsync(string phone, List<SeatPick> picks)
    {
        var showIds = picks.Select(pick => pick.ShowtimeId).Distinct().ToList();
        var shows = await _db.Showtimes.Where(show => showIds.Contains(show.ShowtimeId)).ToListAsync();
        if (shows.Count != showIds.Count)
        {
            return RuleResult.Fail("ไม่พบรอบฉายที่เลือก");
        }

        var today = AppClock.Today;
        if (shows.Any(show => show.Status != ShowtimeStatus.Open || show.ShowDate < today))
        {
            return RuleResult.Fail("มีรอบที่ปิดการจองแล้ว");
        }

        var seatIds = picks.Select(pick => pick.SeatId).Distinct().ToList();
        var seats = await _db.Seats.Where(seat => seatIds.Contains(seat.SeatId)).ToListAsync();
        if (seats.Count != seatIds.Count)
        {
            return RuleResult.Fail("ไม่พบที่นั่งที่เลือก");
        }

        foreach (var pick in picks)
        {
            var show = shows.First(item => item.ShowtimeId == pick.ShowtimeId);
            var seat = seats.First(item => item.SeatId == pick.SeatId);
            if (seat.CinemaId != show.CinemaId)
            {
                return RuleResult.Fail("ที่นั่งไม่ได้อยู่ในโรงของรอบที่เลือก");
            }
        }

        foreach (var pick in picks)
        {
            var taken = await _db.BookingSeats.AnyAsync(item =>
                item.Status == BookingSeatStatus.Booked &&
                item.ShowtimeId == pick.ShowtimeId &&
                item.SeatId == pick.SeatId);
            if (taken)
            {
                return RuleResult.Fail("มีที่นั่งถูกจองไปแล้ว กรุณาเลือกที่นั่งใหม่");
            }
        }

        var booking = new Booking
        {
            PhoneNumber = phone,
            BookedAt = DateTime.Now
        };
        foreach (var pick in picks)
        {
            booking.Seats.Add(new BookingSeat
            {
                ShowtimeId = pick.ShowtimeId,
                SeatId = pick.SeatId,
                Status = BookingSeatStatus.Booked
            });
        }

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        return RuleResult.Ok("จองตั๋วแล้ว");
    }
}
