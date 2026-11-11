namespace NatureMiniPlex.Web.Models;

public class Cinema
{
    public int CinemaId { get; set; }
    public string CinemaName { get; set; } = "";
    public int ColumnCount { get; set; }
    public int RowCount { get; set; }
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}

public class Seat
{
    public int SeatId { get; set; }
    public int CinemaId { get; set; }
    public Cinema Cinema { get; set; } = null!;
    public string SeatRow { get; set; } = "";
    public string SeatColumn { get; set; } = "";
    public string SeatCode { get; set; } = "";
    public ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
}

public class Movie
{
    public int MovieId { get; set; }
    public string Title { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly StopDate { get; set; }
    public MovieStatus Status { get; set; } = MovieStatus.Active;
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}

public class Showtime
{
    public int ShowtimeId { get; set; }
    public int CinemaId { get; set; }
    public Cinema Cinema { get; set; } = null!;
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public TimeOnly StartTime { get; set; }
    public ShowtimeStatus Status { get; set; } = ShowtimeStatus.Open;
    public DateTime? StartedAt { get; set; }
    public ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
}

public class Booking
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public DateTime BookedAt { get; set; }
    public ICollection<BookingSeat> Seats { get; set; } = new List<BookingSeat>();
}

public class BookingSeat
{
    public int BookingSeatId { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    public int ShowtimeId { get; set; }
    public Showtime Showtime { get; set; } = null!;
    public int SeatId { get; set; }
    public Seat Seat { get; set; } = null!;
    public BookingSeatStatus Status { get; set; } = BookingSeatStatus.Booked;
    public DateTime? CancelledAt { get; set; }
}

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "Staff";
}
