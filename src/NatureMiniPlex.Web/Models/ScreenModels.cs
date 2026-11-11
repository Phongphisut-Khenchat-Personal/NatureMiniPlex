namespace NatureMiniPlex.Web.Models;

public class SeatCell
{
    public int SeatId { get; set; }
    public string SeatRow { get; set; } = "";
    public string SeatColumn { get; set; } = "";
    public string SeatCode { get; set; } = "";
    public bool Booked { get; set; }
    public bool InCart { get; set; }
}

public class SeatMapView
{
    public int ShowtimeId { get; set; }
    public string CinemaName { get; set; } = "";
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public string Time { get; set; } = "";
    public int ColumnCount { get; set; }
    public bool Closed { get; set; }
    public string ClosedReason { get; set; } = "";
    public List<SeatCell> Seats { get; set; } = [];
}

public class CancelSeatRow
{
    public int BookingSeatId { get; set; }
    public string BookingCode { get; set; } = "";
    public string CinemaName { get; set; } = "";
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public string SeatCode { get; set; } = "";
    public bool CanCancel { get; set; }
    public string Reason { get; set; } = "";
}

public class ShowReportRow
{
    public int ShowtimeId { get; set; }
    public string CinemaName { get; set; } = "";
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public ShowtimeStatus Status { get; set; }
    public int SeatCount { get; set; }
    public int BookedCount { get; set; }
    public int FreeCount => SeatCount - BookedCount;
}

public class MovieReportRow
{
    public string Title { get; set; } = "";
    public int BookedSeats { get; set; }
}

public class BookingReportRow
{
    public string PhoneNumber { get; set; } = "";
    public string BookingCode { get; set; } = "";
    public string CinemaName { get; set; } = "";
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public string SeatCode { get; set; } = "";
    public BookingSeatStatus Status { get; set; }
    public DateTime BookedAt { get; set; }
}

public class ReportPage
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public int? CinemaId { get; set; }
    public string Phone { get; set; } = "";
    public List<Cinema> Cinemas { get; set; } = [];
    public List<ShowReportRow> Shows { get; set; } = [];
    public List<MovieReportRow> Movies { get; set; } = [];
    public List<BookingReportRow> Bookings { get; set; } = [];
    public DateTime GeneratedAt { get; set; }
}

public class MovieForm
{
    public int MovieId { get; set; }
    public string Title { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly StopDate { get; set; }
}

public class ScheduleDayView
{
    public int CinemaId { get; set; }
    public string CinemaName { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public int? MovieId { get; set; }
    public List<ShowSlot> Slots { get; set; } = [];
    public bool Locked { get; set; }
    public string LockReason { get; set; } = "";
    public List<Movie> Movies { get; set; } = [];
}

public class CinemaSummary
{
    public int CinemaId { get; set; }
    public string CinemaName { get; set; } = "";
    public int ColumnCount { get; set; }
    public int RowCount { get; set; }
    public int SeatCount { get; set; }
}

public class CinemaSeatPage
{
    public int CinemaId { get; set; }
    public string CinemaName { get; set; } = "";
    public int ColumnCount { get; set; }
    public int RowCount { get; set; }
    public List<SeatCell> Seats { get; set; } = [];
}

public class ShowtimeListItem
{
    public int ShowtimeId { get; set; }
    public int CinemaId { get; set; }
    public string CinemaName { get; set; } = "";
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public string Time { get; set; } = "";
    public ShowtimeStatus Status { get; set; }
    public int BookedCount { get; set; }
    public int SeatCount { get; set; }
    public int FreeCount => SeatCount - BookedCount;
}

public class DayCount
{
    public DateOnly Date { get; set; }
    public int BookedSeats { get; set; }
}

public class CinemaShare
{
    public string CinemaName { get; set; } = "";
    public int BookedSeats { get; set; }
    public int SeatCount { get; set; }
    public int ShowsToday { get; set; }
}

public class RecentBooking
{
    public string BookingCode { get; set; } = "";
    public string MovieTitle { get; set; } = "";
    public string CinemaName { get; set; } = "";
    public string SeatCode { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public ShowSlot Slot { get; set; }
    public string Time { get; set; } = "";
    public string Status { get; set; } = "";
}

public class DashboardView
{
    public DateOnly Today { get; set; }
    public int BookedSeatsToday { get; set; }
    public int PhonesToday { get; set; }
    public int CinemaCount { get; set; }
    public int ShowsToday { get; set; }
    public List<DayCount> Days { get; set; } = [];
    public List<CinemaShare> Cinemas { get; set; } = [];
    public List<RecentBooking> Recent { get; set; } = [];
}

public class CartLine
{
    public int ShowtimeId { get; set; }
    public int SeatId { get; set; }
    public string SeatCode { get; set; } = "";
    public string MovieTitle { get; set; } = "";
    public string CinemaName { get; set; } = "";
    public string WhenText { get; set; } = "";
}
