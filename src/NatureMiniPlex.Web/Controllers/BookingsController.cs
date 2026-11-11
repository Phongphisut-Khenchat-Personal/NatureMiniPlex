using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

public class BookingsController : Controller
{
    private readonly BookingService _bookings;

    public BookingsController(BookingService bookings) => _bookings = bookings;

    public async Task<IActionResult> Index()
    {
        ViewBag.Cart = CartSession.Get(HttpContext.Session);
        return View(await _bookings.OpenShowtimesAsync());
    }

    public async Task<IActionResult> Show(int id)
    {
        var map = await _bookings.GetSeatMapAsync(id, CartSession.Get(HttpContext.Session));
        if (map == null)
        {
            return NotFound();
        }

        ViewBag.Cart = CartSession.Get(HttpContext.Session);
        return View(map);
    }

    [HttpPost]
    public async Task<IActionResult> Add(int showtimeId, int[]? seatIds)
    {
        var cart = CartSession.Get(HttpContext.Session);
        var map = await _bookings.GetSeatMapAsync(showtimeId, cart);
        if (map == null)
        {
            return NotFound();
        }

        if (map.Closed)
        {
            TempData["Error"] = map.ClosedReason;
            return RedirectToAction(nameof(Show), new { id = showtimeId });
        }

        if (seatIds == null || seatIds.Length == 0)
        {
            TempData["Error"] = "กรุณาเลือกอย่างน้อย 1 ที่นั่ง";
            return RedirectToAction(nameof(Show), new { id = showtimeId });
        }

        foreach (var seatId in seatIds.Distinct())
        {
            var seat = map.Seats.FirstOrDefault(item => item.SeatId == seatId);
            if (seat == null || seat.Booked)
            {
                TempData["Error"] = "มีที่นั่งที่จองไม่ได้";
                return RedirectToAction(nameof(Show), new { id = showtimeId });
            }

            if (cart.Any(line => line.ShowtimeId == showtimeId && line.SeatId == seatId))
            {
                continue;
            }

            if (cart.Count >= 4)
            {
                TempData["Error"] = "จองได้ไม่เกิน 4 ที่นั่งต่อการจอง";
                CartSession.Save(HttpContext.Session, cart);
                return RedirectToAction(nameof(Index));
            }

            cart.Add(new CartLine
            {
                ShowtimeId = showtimeId,
                SeatId = seatId,
                SeatCode = seat.SeatCode,
                MovieTitle = map.MovieTitle,
                CinemaName = map.CinemaName,
                WhenText = $"{ThaiDate.Day(map.ShowDate)} รอบ{ShowSlotNames.Thai(map.Slot)}"
            });
        }

        CartSession.Save(HttpContext.Session, cart);
        TempData["Success"] = "เพิ่มที่นั่งลงรายการแล้ว กรอกเบอร์โทรแล้วกดยืนยันเพื่อบันทึกการจอง";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public IActionResult Remove(int showtimeId, int seatId)
    {
        var cart = CartSession.Get(HttpContext.Session);
        cart.RemoveAll(line => line.ShowtimeId == showtimeId && line.SeatId == seatId);
        CartSession.Save(HttpContext.Session, cart);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Confirm(string phone)
    {
        var cart = CartSession.Get(HttpContext.Session);
        var result = await _bookings.BookAsync(
            phone,
            cart.Select(line => new SeatPick(line.ShowtimeId, line.SeatId)).ToList());
        if (!result.Success)
        {
            TempData["Error"] = result.Message;
            return RedirectToAction(nameof(Index));
        }

        CartSession.Clear(HttpContext.Session);
        TempData["Success"] = $"{result.Message} เบอร์ {PhoneNumber.Normalize(phone)}";
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Cancel(string? phone)
    {
        ViewBag.Phone = phone ?? "";
        var rows = string.IsNullOrWhiteSpace(phone)
            ? []
            : await _bookings.SeatsForPhoneAsync(phone);
        if (!string.IsNullOrWhiteSpace(phone) && PhoneNumber.Normalize(phone) == null)
        {
            TempData["Error"] = "กรุณากรอกเบอร์โทร 10 หลัก ขึ้นต้นด้วย 0";
        }

        return View(rows);
    }

    [HttpPost]
    public async Task<IActionResult> CancelSeats(string phone, int[]? bookingSeatIds)
    {
        var result = await _bookings.CancelAsync(phone, bookingSeatIds ?? []);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Cancel), new { phone });
    }
}
