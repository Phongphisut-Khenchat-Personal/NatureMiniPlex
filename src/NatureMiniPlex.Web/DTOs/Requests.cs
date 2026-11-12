using NatureMiniPlex.Web.Models;
using NatureMiniPlex.Web.Services;

namespace NatureMiniPlex.Web.DTOs;

public record LoginRequest(string Username, string Password);

public record MovieRequest(string Title, DateOnly StartDate, DateOnly StopDate, bool Recommended = false);

public record CinemaRequest(string Name, string Layout);

public record CinemaNameRequest(string Name);

public record SeatClosedRequest(bool Closed);

public record ShowtimeRequest(int CinemaId, int MovieId, DateOnly ShowDate, ShowSlot Slot);

public record ShowtimeMovieRequest(int MovieId);

public record BookRequest(string Phone, List<SeatPick> Seats);

public record CancelRequest(string Phone, List<int> BookingSeatIds);
