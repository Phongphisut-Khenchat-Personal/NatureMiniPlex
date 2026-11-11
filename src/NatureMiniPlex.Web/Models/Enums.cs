using System.Globalization;

namespace NatureMiniPlex.Web.Models;

public enum MovieStatus
{
    Active = 0,
    Cancelled = 1
}

public enum ShowSlot
{
    Morning = 1,
    Afternoon = 2,
    Evening = 3,
    LateNight = 4
}

public enum ShowtimeStatus
{
    Open = 0,
    Cancelled = 1,
    Started = 2
}

public enum BookingSeatStatus
{
    Booked = 0,
    Cancelled = 1
}

public static class AppClock
{
    public static DateOnly Today => DateOnly.FromDateTime(DateTime.Today);
}

public static class PhoneNumber
{
    public static string? Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return null;
        }

        var digits = new string(input.Where(char.IsDigit).ToArray());
        if (digits.Length != 10 || digits[0] != '0')
        {
            return null;
        }

        return digits;
    }
}

public static class ShowSlotNames
{
    public static readonly ShowSlot[] All =
    [
        ShowSlot.Morning,
        ShowSlot.Afternoon,
        ShowSlot.Evening,
        ShowSlot.LateNight
    ];

    public static string Thai(ShowSlot slot) => slot switch
    {
        ShowSlot.Morning => "เช้า",
        ShowSlot.Afternoon => "กลางวัน",
        ShowSlot.Evening => "เย็น",
        ShowSlot.LateNight => "ดึก",
        _ => slot.ToString()
    };

    // แต่ละช่วงมีเวลาตายตัว โรงเดียวกันจึงไม่มีรอบที่เวลาชนกัน
    public static TimeOnly TimeOf(ShowSlot slot) => slot switch
    {
        ShowSlot.Morning => new TimeOnly(10, 0),
        ShowSlot.Afternoon => new TimeOnly(13, 0),
        ShowSlot.Evening => new TimeOnly(16, 0),
        ShowSlot.LateNight => new TimeOnly(20, 0),
        _ => new TimeOnly(10, 0)
    };

    public static string Clock(ShowSlot slot) => TimeOf(slot).ToString("HH:mm");
}

public static class StatusNames
{
    public static string Movie(MovieStatus status) => status switch
    {
        MovieStatus.Active => "เปิดอยู่",
        MovieStatus.Cancelled => "ยกเลิกแล้ว",
        _ => status.ToString()
    };

    public static string Showtime(ShowtimeStatus status) => status switch
    {
        ShowtimeStatus.Open => "เปิดจอง",
        ShowtimeStatus.Cancelled => "ยกเลิกรอบ",
        ShowtimeStatus.Started => "เริ่มฉายแล้ว",
        _ => status.ToString()
    };

    public static string BookingSeat(BookingSeatStatus status) => status switch
    {
        BookingSeatStatus.Booked => "จองอยู่",
        BookingSeatStatus.Cancelled => "ยกเลิกแล้ว",
        _ => status.ToString()
    };
}

public static class ThaiDate
{
    private static readonly CultureInfo Thai = CultureInfo.GetCultureInfo("th-TH");

    public static string Day(DateOnly date) => date.ToString("d MMMM yyyy", Thai);

    public static string DateTime(DateTime value) => value.ToString("d MMMM yyyy HH:mm", Thai);
}
