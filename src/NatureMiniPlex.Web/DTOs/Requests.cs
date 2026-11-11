using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.DTOs;

public record LoginRequest(string Username, string Password);

public record MovieRequest(string Title, DateOnly StartDate, DateOnly StopDate);

public record ShowtimeRequest(int CinemaId, int MovieId, DateOnly ShowDate, ShowSlot Slot);

public record ShowtimeMovieRequest(int MovieId);

public record BookRequest(string Phone, List<SeatPick> Seats);

public record CancelRequest(string Phone, List<int> BookingSeatIds);
