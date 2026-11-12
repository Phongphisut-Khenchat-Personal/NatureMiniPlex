using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Services;

public class CinemaService
{
    private readonly AppDbContext _db;

    public CinemaService(AppDbContext db) => _db = db;

    public async Task<RuleResult> CreateAsync(string? name, string? layout)
    {
        var cinemaName = name?.Trim() ?? "";
        if (cinemaName.Length == 0 || cinemaName.Length > 100)
        {
            return RuleResult.Fail("กรุณาระบุชื่อโรงไม่เกิน 100 ตัวอักษร");
        }

        if (await _db.Cinemas.AnyAsync(cinema => cinema.CinemaName == cinemaName))
        {
            return RuleResult.Fail("มีโรงชื่อนี้อยู่แล้ว");
        }

        var (columns, rows) = layout switch
        {
            "Six" => (3, 2),
            "Twelve" => (4, 3),
            _ => (0, 0)
        };
        if (columns == 0)
        {
            return RuleResult.Fail("เลือกผัง 6 ที่นั่ง หรือ 12 ที่นั่ง");
        }

        var cinema = new Cinema
        {
            CinemaName = cinemaName,
            ColumnCount = columns,
            RowCount = rows
        };
        _db.Cinemas.Add(cinema);
        await _db.SaveChangesAsync();
        _db.Seats.AddRange(SeatLayout.Create(cinema));
        await _db.SaveChangesAsync();
        return RuleResult.Ok("เพิ่มโรงภาพยนตร์แล้ว", cinema.CinemaId);
    }

    public async Task<RuleResult> RenameAsync(int cinemaId, string? name)
    {
        var cinema = await _db.Cinemas.FirstOrDefaultAsync(item => item.CinemaId == cinemaId);
        if (cinema == null)
        {
            return RuleResult.Fail("ไม่พบโรงหนัง");
        }

        var cinemaName = name?.Trim() ?? "";
        if (cinemaName.Length == 0 || cinemaName.Length > 100)
        {
            return RuleResult.Fail("กรุณาระบุชื่อโรงไม่เกิน 100 ตัวอักษร");
        }

        if (await _db.Cinemas.AnyAsync(item => item.CinemaId != cinemaId && item.CinemaName == cinemaName))
        {
            return RuleResult.Fail("มีโรงชื่อนี้อยู่แล้ว");
        }

        cinema.CinemaName = cinemaName;
        await _db.SaveChangesAsync();
        return RuleResult.Ok("เปลี่ยนชื่อโรงแล้ว");
    }

    public async Task<RuleResult> RemoveAsync(int cinemaId)
    {
        var cinema = await _db.Cinemas.FirstOrDefaultAsync(item => item.CinemaId == cinemaId);
        if (cinema == null)
        {
            return RuleResult.Fail("ไม่พบโรงหนัง");
        }

        if (await _db.Showtimes.AnyAsync(show => show.CinemaId == cinemaId))
        {
            return RuleResult.Fail("โรงนี้มีรอบฉายแล้ว จึงลบไม่ได้");
        }

        var seats = await _db.Seats.Where(seat => seat.CinemaId == cinemaId).ToListAsync();
        _db.Seats.RemoveRange(seats);
        _db.Cinemas.Remove(cinema);
        await _db.SaveChangesAsync();
        return RuleResult.Ok("ลบโรงภาพยนตร์แล้ว");
    }

    public async Task<RuleResult> SetSeatClosedAsync(int cinemaId, int seatId, bool closed)
    {
        var seat = await _db.Seats.FirstOrDefaultAsync(item => item.SeatId == seatId && item.CinemaId == cinemaId);
        if (seat == null)
        {
            return RuleResult.Fail("ไม่พบที่นั่ง");
        }

        if (closed && !seat.IsClosed)
        {
            var today = AppClock.Today;
            var held = await _db.BookingSeats.AnyAsync(item =>
                item.SeatId == seatId &&
                item.Status == BookingSeatStatus.Booked &&
                item.Showtime.Status == ShowtimeStatus.Open &&
                item.Showtime.ShowDate >= today);
            if (held)
            {
                return RuleResult.Fail("ที่นั่งนี้ถูกจองในรอบที่ยังเปิดอยู่ จึงปิดซ่อมไม่ได้");
            }
        }

        seat.IsClosed = closed;
        await _db.SaveChangesAsync();
        return RuleResult.Ok(closed ? "ปิดที่นั่งนี้แล้ว" : "เปิดที่นั่งนี้แล้ว");
    }
}
