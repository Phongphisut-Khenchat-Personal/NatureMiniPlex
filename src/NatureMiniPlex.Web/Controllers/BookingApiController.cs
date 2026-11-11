using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.DTOs;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.Controllers;

[ApiController]
[IgnoreAntiforgeryToken]
[Route("api/bookings")]
public class BookingApiController : ControllerBase
{
    private readonly BookingService _bookings;

    public BookingApiController(BookingService bookings) => _bookings = bookings;

    [HttpGet]
    public async Task<IActionResult> Find(string? phone, string? code) =>
        Ok(await _bookings.FindAsync(phone, code));

    [HttpPost]
    public async Task<IActionResult> Create(BookRequest request)
    {
        if (request.Seats == null || request.Seats.Count == 0)
        {
            return BadRequest(new { message = "กรุณาเลือกที่นั่ง" });
        }

        return ApiResults.From(await _bookings.BookAsync(request.Phone, request.Seats));
    }

    [HttpPost("cancel")]
    public async Task<IActionResult> Cancel(CancelRequest request)
    {
        if (request.BookingSeatIds == null || request.BookingSeatIds.Count == 0)
        {
            return BadRequest(new { message = "กรุณาเลือกที่นั่งที่จะยกเลิก" });
        }

        return ApiResults.From(await _bookings.CancelAsync(request.Phone, request.BookingSeatIds));
    }
}
