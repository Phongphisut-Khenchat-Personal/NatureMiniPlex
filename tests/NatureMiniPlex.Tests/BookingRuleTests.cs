using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Tests;

public class BookingRuleTests : IAsyncLifetime
{
    private const string ConnectionString =
        "Server=localhost,1433;Database=NatureMiniPlex_Test;User Id=sa;Password=NatureMiniPlex!2026;TrustServerCertificate=True;MultipleActiveResultSets=True";

    private int _sriracha;
    private int _bangsaen;

    public async Task InitializeAsync()
    {
        await using var db = CreateContext();
        await db.Database.MigrateAsync();
        await db.BookingSeats.ExecuteDeleteAsync();
        await db.Bookings.ExecuteDeleteAsync();
        await db.Showtimes.ExecuteDeleteAsync();
        await db.Movies.ExecuteDeleteAsync();
        await db.Seats.ExecuteDeleteAsync();
        await db.Cinemas.ExecuteDeleteAsync();
        await DbSeeder.SeedCinemasAsync(db);
        _sriracha = await db.Cinemas.Where(cinema => cinema.CinemaName.Contains("ศรีราชา")).Select(cinema => cinema.CinemaId).SingleAsync();
        _bangsaen = await db.Cinemas.Where(cinema => cinema.CinemaName.Contains("บางแสน")).Select(cinema => cinema.CinemaId).SingleAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Booking_a_free_seat_succeeds()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Free Seat", ShowSlot.Morning);
        var showId = await ShowId(_sriracha, today, ShowSlot.Morning);
        var seatId = await SeatId(_sriracha, "A-หลัง");

        var result = await Book("0812345678", new SeatPick(showId, seatId));

        Assert.True(result.Success, result.Message);
        await using var db = CreateContext();
        Assert.Equal(1, await db.BookingSeats.CountAsync(item => item.Status == BookingSeatStatus.Booked));
    }

    [Fact]
    public async Task Booking_a_taken_seat_fails()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Taken Seat", ShowSlot.Morning);
        var showId = await ShowId(_sriracha, today, ShowSlot.Morning);
        var seatId = await SeatId(_sriracha, "A-หน้า");
        Assert.True((await Book("0812345678", new SeatPick(showId, seatId))).Success);

        var second = await Book("0899999999", new SeatPick(showId, seatId));

        Assert.False(second.Success);
        await using var db = CreateContext();
        Assert.Equal(1, await db.BookingSeats.CountAsync(item => item.Status == BookingSeatStatus.Booked));
    }

    [Fact]
    public async Task Booking_more_than_four_seats_fails()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Too Many Seats", ShowSlot.Morning);
        var showId = await ShowId(_sriracha, today, ShowSlot.Morning);
        await using var db = CreateContext();
        var seats = await db.Seats.Where(seat => seat.CinemaId == _sriracha).OrderBy(seat => seat.SeatCode).Take(5).Select(seat => seat.SeatId).ToListAsync();

        var result = await new BookingService(db).BookAsync("0812345678", seats.Select(seat => new SeatPick(showId, seat)).ToList());

        Assert.False(result.Success);
        Assert.Equal(0, await db.Bookings.CountAsync());
    }

    [Fact]
    public async Task One_booking_can_span_showtimes()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Two Shows", ShowSlot.Morning, ShowSlot.Evening);
        var morning = await ShowId(_sriracha, today, ShowSlot.Morning);
        var evening = await ShowId(_sriracha, today, ShowSlot.Evening);

        var result = await Book(
            "0812345678",
            new SeatPick(morning, await SeatId(_sriracha, "A-หลัง")),
            new SeatPick(evening, await SeatId(_sriracha, "B-หลัง")));

        Assert.True(result.Success, result.Message);
        await using var db = CreateContext();
        Assert.Equal(1, await db.Bookings.CountAsync());
        Assert.Equal(2, await db.BookingSeats.CountAsync());
    }

    [Fact]
    public async Task One_booking_can_span_movies()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Nice Day", ShowSlot.Morning);
        await SaveShow(_bangsaen, today, today, today, "Bad Day", ShowSlot.Afternoon);
        var nice = await ShowId(_sriracha, today, ShowSlot.Morning);
        var bad = await ShowId(_bangsaen, today, ShowSlot.Afternoon);

        var result = await Book(
            "0812345678",
            new SeatPick(nice, await SeatId(_sriracha, "C-หน้า")),
            new SeatPick(bad, await SeatId(_bangsaen, "D-กลาง")));

        Assert.True(result.Success, result.Message);
        await using var db = CreateContext();
        Assert.Equal(2, await db.BookingSeats.Select(item => item.Showtime.MovieId).Distinct().CountAsync());
    }

    [Fact]
    public async Task Cancelling_with_a_different_phone_fails()
    {
        var bookingSeatId = await BookOneSeat("0812345678");

        await using var db = CreateContext();
        var result = await new BookingService(db).CancelAsync("0899999999", [bookingSeatId]);

        Assert.False(result.Success);
        Assert.Equal(BookingSeatStatus.Booked, await db.BookingSeats.Where(item => item.BookingSeatId == bookingSeatId).Select(item => item.Status).SingleAsync());
    }

    [Fact]
    public async Task Cancelling_after_the_show_starts_fails()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Started Cancel", ShowSlot.Evening);
        var showId = await ShowId(_sriracha, today, ShowSlot.Evening);
        var bookingSeatId = await BookSeat(showId, await SeatId(_sriracha, "B-หน้า"), "0812345678");
        await using var db = CreateContext();
        Assert.True((await new ScheduleService(db).ConfirmStartAsync(showId)).Success);

        var result = await new BookingService(db).CancelAsync("0812345678", [bookingSeatId]);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Booking_after_the_show_starts_fails()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Started Book", ShowSlot.Afternoon);
        var showId = await ShowId(_sriracha, today, ShowSlot.Afternoon);
        await using var db = CreateContext();
        Assert.True((await new ScheduleService(db).ConfirmStartAsync(showId)).Success);

        var result = await new BookingService(db).BookAsync("0812345678", [new SeatPick(showId, await SeatId(_sriracha, "C-หลัง"))]);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task More_than_three_showtimes_in_one_day_fails()
    {
        var today = AppClock.Today;
        var result = await SaveShow(_sriracha, today, today, today, "Four Shows", ShowSlot.Morning, ShowSlot.Afternoon, ShowSlot.Evening, ShowSlot.LateNight);

        Assert.False(result.Success);
        await using var db = CreateContext();
        Assert.Equal(0, await db.Showtimes.CountAsync());
    }

    [Fact]
    public async Task Showtime_outside_the_movie_dates_fails()
    {
        var today = AppClock.Today;
        var result = await SaveShow(_sriracha, today.AddDays(1), today, today, "Short Run", ShowSlot.Morning);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Only_one_concurrent_booking_keeps_the_seat()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Race", ShowSlot.Morning);
        var showId = await ShowId(_sriracha, today, ShowSlot.Morning);
        var seatId = await SeatId(_sriracha, "B-หลัง");

        var first = Task.Run(() => Book("0811111111", new SeatPick(showId, seatId)));
        var second = Task.Run(() => Book("0822222222", new SeatPick(showId, seatId)));
        var results = await Task.WhenAll(first, second);

        Assert.Equal(1, results.Count(result => result.Success));
        await using var db = CreateContext();
        Assert.Equal(1, await db.BookingSeats.CountAsync(item => item.Status == BookingSeatStatus.Booked && item.SeatId == seatId));
    }

    [Fact]
    public async Task Cancelling_with_the_right_phone_frees_the_seat()
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Rebook", ShowSlot.Morning);
        var showId = await ShowId(_sriracha, today, ShowSlot.Morning);
        var seatId = await SeatId(_sriracha, "C-หน้า");
        var bookingSeatId = await BookSeat(showId, seatId, "0812345678");
        await using var db = CreateContext();
        Assert.True((await new BookingService(db).CancelAsync("0812345678", [bookingSeatId])).Success);

        var again = await Book("0899999999", new SeatPick(showId, seatId));

        Assert.True(again.Success, again.Message);
    }

    [Fact]
    public async Task Booking_after_the_show_date_fails()
    {
        var yesterday = AppClock.Today.AddDays(-1);
        await SaveShow(_sriracha, yesterday, yesterday, AppClock.Today, "Yesterday", ShowSlot.Morning);
        var showId = await ShowId(_sriracha, yesterday, ShowSlot.Morning);

        var result = await Book("0812345678", new SeatPick(showId, await SeatId(_sriracha, "A-หลัง")));

        Assert.False(result.Success);
    }

    private static AppDbContext CreateContext() => AppDbContextFactory.Create(ConnectionString);

    private async Task<RuleResult> SaveShow(int cinemaId, DateOnly showDate, DateOnly start, DateOnly stop, string title, params ShowSlot[] slots)
    {
        await using var db = CreateContext();
        var created = await new MovieService(db).CreateAsync(title, start, stop);
        if (!created.Success)
        {
            return created;
        }

        var movieId = await db.Movies.Where(movie => movie.Title == title).Select(movie => movie.MovieId).SingleAsync();
        return await new ScheduleService(db).SaveDayAsync(cinemaId, showDate, movieId, slots);
    }

    private async Task<int> ShowId(int cinemaId, DateOnly date, ShowSlot slot)
    {
        await using var db = CreateContext();
        return await db.Showtimes
            .Where(show => show.CinemaId == cinemaId && show.ShowDate == date && show.Slot == slot)
            .Select(show => show.ShowtimeId)
            .SingleAsync();
    }

    private async Task<int> SeatId(int cinemaId, string code)
    {
        await using var db = CreateContext();
        return await db.Seats
            .Where(seat => seat.CinemaId == cinemaId && seat.SeatCode == code)
            .Select(seat => seat.SeatId)
            .SingleAsync();
    }

    private async Task<RuleResult> Book(string phone, params SeatPick[] picks)
    {
        await using var db = CreateContext();
        return await new BookingService(db).BookAsync(phone, picks);
    }

    private async Task<int> BookOneSeat(string phone)
    {
        var today = AppClock.Today;
        await SaveShow(_sriracha, today, today, today, "Owned Seat", ShowSlot.LateNight);
        return await BookSeat(await ShowId(_sriracha, today, ShowSlot.LateNight), await SeatId(_sriracha, "A-หน้า"), phone);
    }

    private async Task<int> BookSeat(int showId, int seatId, string phone)
    {
        Assert.True((await Book(phone, new SeatPick(showId, seatId))).Success);
        await using var db = CreateContext();
        return await db.BookingSeats
            .Where(item => item.ShowtimeId == showId && item.SeatId == seatId && item.Status == BookingSeatStatus.Booked)
            .Select(item => item.BookingSeatId)
            .SingleAsync();
    }
}
