using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Data;

public static class DbSeeder
{
    public static async Task SeedCinemasAsync(AppDbContext db)
    {
        if (await db.Cinemas.AnyAsync())
        {
            return;
        }

        var sriracha = new Cinema { CinemaName = "โรงหนังศรีราชา", ColumnCount = 3, RowCount = 2 };
        var bangsaen = new Cinema { CinemaName = "โรงหนังบางแสน", ColumnCount = 4, RowCount = 3 };
        db.Cinemas.AddRange(sriracha, bangsaen);
        await db.SaveChangesAsync();

        db.Seats.AddRange(SeatLayout.Create(sriracha));
        db.Seats.AddRange(SeatLayout.Create(bangsaen));
        await db.SaveChangesAsync();
    }

    public static async Task SeedDemoAsync(AppDbContext db)
    {
        if (await db.Movies.AnyAsync())
        {
            return;
        }

        var today = AppClock.Today;
        var tomorrow = today.AddDays(1);
        var nice = new Movie
        {
            Title = "Mr. Nice Guy",
            StartDate = today,
            StopDate = tomorrow,
            Status = MovieStatus.Active
        };
        var bad = new Movie
        {
            Title = "Mr. Bad Guy",
            StartDate = today,
            StopDate = tomorrow,
            Status = MovieStatus.Active
        };
        var later = today.AddDays(5);
        var bay = new Movie { Title = "แสงสุดท้ายของอ่าว", StartDate = today, StopDate = later, Status = MovieStatus.Active };
        var night = new Movie { Title = "คืนที่บางแสนไม่หลับ", StartDate = today, StopDate = later, Status = MovieStatus.Active };
        var neighbor = new Movie { Title = "เพื่อนบ้านข้างโรงหนัง", StartDate = today, StopDate = later, Status = MovieStatus.Active };
        db.Movies.AddRange(nice, bad, bay, night, neighbor);
        await db.SaveChangesAsync();

        var srirachaId = await db.Cinemas.Where(c => c.CinemaName.Contains("ศรีราชา")).Select(c => c.CinemaId).SingleAsync();
        var bangsaenId = await db.Cinemas.Where(c => c.CinemaName.Contains("บางแสน")).Select(c => c.CinemaId).SingleAsync();
        var dayAfter = today.AddDays(2);

        db.Showtimes.AddRange(
            Show(srirachaId, nice.MovieId, today, ShowSlot.Morning),
            Show(srirachaId, bay.MovieId, today, ShowSlot.Afternoon),
            Show(srirachaId, nice.MovieId, today, ShowSlot.Evening),
            Show(srirachaId, nice.MovieId, tomorrow, ShowSlot.Morning),
            Show(srirachaId, nice.MovieId, tomorrow, ShowSlot.Afternoon),
            Show(srirachaId, nice.MovieId, tomorrow, ShowSlot.Evening),
            Show(srirachaId, bay.MovieId, dayAfter, ShowSlot.Morning),
            Show(srirachaId, neighbor.MovieId, dayAfter, ShowSlot.Evening),
            Show(bangsaenId, night.MovieId, today, ShowSlot.Morning),
            Show(bangsaenId, neighbor.MovieId, today, ShowSlot.Evening),
            Show(bangsaenId, bad.MovieId, today, ShowSlot.LateNight),
            Show(bangsaenId, night.MovieId, tomorrow, ShowSlot.Morning),
            Show(bangsaenId, bad.MovieId, tomorrow, ShowSlot.Afternoon),
            Show(bangsaenId, bad.MovieId, tomorrow, ShowSlot.Evening));
        await db.SaveChangesAsync();

        var morningId = await db.Showtimes
            .Where(s => s.CinemaId == srirachaId && s.ShowDate == today && s.Slot == ShowSlot.Morning)
            .Select(s => s.ShowtimeId)
            .SingleAsync();
        var seatId = await db.Seats
            .Where(s => s.CinemaId == srirachaId && s.SeatCode == "A-หน้า")
            .Select(s => s.SeatId)
            .SingleAsync();

        var booking = new Booking
        {
            BookingCode = "NMSEED0001",
            PhoneNumber = "0891111111",
            BookedAt = DateTime.Now,
            Seats =
            {
                new BookingSeat
                {
                    ShowtimeId = morningId,
                    SeatId = seatId,
                    Status = BookingSeatStatus.Booked
                }
            }
        };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        booking.BookingCode = $"NM{booking.BookedAt:yyyyMMdd}{booking.BookingId:D4}";
        await db.SaveChangesAsync();
    }

    public static async Task SeedStaffAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        db.Users.Add(new User
        {
            Username = "admin",
            PasswordHash = PasswordBox.Hash("Admin@1234"),
            Role = "Staff"
        });
        await db.SaveChangesAsync();
    }

    private static Showtime Show(int cinemaId, int movieId, DateOnly date, ShowSlot slot) => new()
    {
        CinemaId = cinemaId,
        MovieId = movieId,
        ShowDate = date,
        Slot = slot,
        StartTime = ShowSlotNames.TimeOf(slot),
        Status = ShowtimeStatus.Open
    };
}
