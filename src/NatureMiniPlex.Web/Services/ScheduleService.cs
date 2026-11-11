using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Services;

public class ScheduleService
{
    private readonly AppDbContext _db;

    public ScheduleService(AppDbContext db) => _db = db;

    public Task<List<Cinema>> CinemasAsync() =>
        _db.Cinemas.OrderBy(cinema => cinema.CinemaId).ToListAsync();

    public Task<List<Showtime>> ListAsync(DateOnly from, DateOnly to) =>
        _db.Showtimes
            .Include(show => show.Cinema)
            .Include(show => show.Movie)
            .Where(show => show.Status != ShowtimeStatus.Cancelled && show.ShowDate >= from && show.ShowDate <= to)
            .OrderBy(show => show.ShowDate)
            .ThenBy(show => show.CinemaId)
            .ThenBy(show => show.Slot)
            .ToListAsync();

    public async Task<ScheduleDayView?> GetDayAsync(int cinemaId, DateOnly showDate)
    {
        var cinema = await _db.Cinemas.FirstOrDefaultAsync(item => item.CinemaId == cinemaId);
        if (cinema == null)
        {
            return null;
        }

        var rows = await _db.Showtimes
            .Include(show => show.BookingSeats)
            .Where(show => show.CinemaId == cinemaId && show.ShowDate == showDate && show.Status != ShowtimeStatus.Cancelled)
            .ToListAsync();

        var locked = rows.Any(IsLocked);
        return new ScheduleDayView
        {
            CinemaId = cinemaId,
            CinemaName = cinema.CinemaName,
            ShowDate = showDate,
            MovieId = rows.Select(show => (int?)show.MovieId).FirstOrDefault(),
            Slots = rows.Select(show => show.Slot).Distinct().ToList(),
            Locked = locked,
            LockReason = locked ? "วันนี้มีรอบที่ถูกจองหรือเริ่มฉายแล้ว จึงแก้ตารางไม่ได้" : ""
        };
    }

    public async Task<RuleResult> SaveDayAsync(int cinemaId, DateOnly showDate, int movieId, IReadOnlyCollection<ShowSlot> slots)
    {
        if (!await _db.Cinemas.AnyAsync(cinema => cinema.CinemaId == cinemaId))
        {
            return RuleResult.Fail("ไม่พบโรงหนัง");
        }

        var selected = slots.Distinct().ToList();
        if (selected.Count is < 1 or > 3)
        {
            return RuleResult.Fail("แต่ละโรงในหนึ่งวันต้องมี 1 ถึง 3 รอบ");
        }

        var movie = await _db.Movies.FirstOrDefaultAsync(item => item.MovieId == movieId);
        if (movie == null || movie.Status != MovieStatus.Active)
        {
            return RuleResult.Fail("ไม่พบเรื่องหนัง หรือเรื่องนี้ถูกยกเลิกแล้ว");
        }

        if (showDate < movie.StartDate || showDate > movie.StopDate)
        {
            return RuleResult.Fail("วันที่ฉายต้องอยู่ในช่วงเริ่มต้นถึงสิ้นสุดของเรื่อง");
        }

        var rows = await _db.Showtimes
            .Include(show => show.BookingSeats)
            .Where(show => show.CinemaId == cinemaId && show.ShowDate == showDate)
            .ToListAsync();
        if (rows.Any(IsLocked))
        {
            return RuleResult.Fail("วันนี้มีรอบที่ถูกจองหรือเริ่มฉายแล้ว จึงแก้ตารางไม่ได้");
        }

        // โรงเดียวกันในหนึ่งวันฉายได้เรื่องเดียว จึงใส่ MovieId เดียวกันให้ทุกรอบที่เลือก
        // ดัชนีไม่ให้โรง วัน และช่วงเวลาซ้ำ แม้รอบจะถูกยกเลิกไปแล้ว จึงเปิดแถวเดิมกลับมาใช้ใหม่
        var keep = selected.ToHashSet();
        foreach (var show in rows.Where(show => show.Status != ShowtimeStatus.Cancelled && !keep.Contains(show.Slot)))
        {
            show.Status = ShowtimeStatus.Cancelled;
        }

        foreach (var slot in selected)
        {
            var show = rows.FirstOrDefault(item => item.Slot == slot);
            if (show == null)
            {
                _db.Showtimes.Add(new Showtime
                {
                    CinemaId = cinemaId,
                    MovieId = movieId,
                    ShowDate = showDate,
                    Slot = slot,
                    Status = ShowtimeStatus.Open
                });
                continue;
            }

            show.MovieId = movieId;
            show.Status = ShowtimeStatus.Open;
            show.StartedAt = null;
        }

        await _db.SaveChangesAsync();
        return RuleResult.Ok("บันทึกรอบฉายแล้ว วันนี้ทุกรอบฉายเรื่องเดียวกัน");
    }

    public async Task<RuleResult> CancelDayAsync(int cinemaId, DateOnly showDate)
    {
        var rows = await _db.Showtimes
            .Include(show => show.BookingSeats)
            .Where(show => show.CinemaId == cinemaId && show.ShowDate == showDate && show.Status != ShowtimeStatus.Cancelled)
            .ToListAsync();
        if (rows.Count == 0)
        {
            return RuleResult.Fail("วันนี้ยังไม่มีรอบฉาย");
        }

        if (rows.Any(IsLocked))
        {
            return RuleResult.Fail("วันนี้มีรอบที่ถูกจองหรือเริ่มฉายแล้ว จึงยกเลิกไม่ได้");
        }

        foreach (var show in rows)
        {
            show.Status = ShowtimeStatus.Cancelled;
        }

        await _db.SaveChangesAsync();
        return RuleResult.Ok("ยกเลิกรอบฉายของวันนี้แล้ว");
    }

    public async Task<RuleResult> ConfirmStartAsync(int showtimeId)
    {
        var show = await _db.Showtimes.FirstOrDefaultAsync(item => item.ShowtimeId == showtimeId);
        if (show == null || show.Status == ShowtimeStatus.Cancelled)
        {
            return RuleResult.Fail("ไม่พบรอบฉาย");
        }

        if (show.Status == ShowtimeStatus.Started)
        {
            return RuleResult.Fail("รอบนี้ยืนยันเริ่มฉายไปแล้ว");
        }

        if (show.ShowDate > AppClock.Today)
        {
            return RuleResult.Fail("ยืนยันเริ่มฉายได้เมื่อถึงวันฉาย");
        }

        show.Status = ShowtimeStatus.Started;
        show.StartedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        return RuleResult.Ok("ยืนยันเริ่มฉายแล้ว รอบนี้ปิดการจองและยกเลิกการจอง");
    }

    private static bool IsLocked(Showtime show) =>
        show.Status == ShowtimeStatus.Started ||
        (show.Status == ShowtimeStatus.Open && show.BookingSeats.Any(seat => seat.Status == BookingSeatStatus.Booked));
}
