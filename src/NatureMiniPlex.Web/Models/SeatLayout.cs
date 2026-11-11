namespace NatureMiniPlex.Web.Models;

public static class SeatLayout
{
    private static readonly string[] RowOrder = ["หน้า", "กลาง", "หลัง"];

    public static string RowName(int rowIndex, int rowCount)
    {
        if (rowCount == 2)
        {
            return rowIndex == 0 ? "หน้า" : "หลัง";
        }

        return rowIndex switch
        {
            0 => "หน้า",
            1 => "กลาง",
            _ => "หลัง"
        };
    }

    public static List<Seat> Create(Cinema cinema)
    {
        var seats = new List<Seat>();
        for (var row = 0; row < cinema.RowCount; row++)
        {
            var rowName = RowName(row, cinema.RowCount);
            for (var column = 0; column < cinema.ColumnCount; column++)
            {
                var columnName = ((char)('A' + column)).ToString();
                seats.Add(new Seat
                {
                    CinemaId = cinema.CinemaId,
                    SeatRow = rowName,
                    SeatColumn = columnName,
                    SeatCode = $"{columnName}-{rowName}"
                });
            }
        }

        return seats;
    }

    public static IEnumerable<Seat> InDisplayOrder(IEnumerable<Seat> seats) =>
        seats.OrderBy(seat => Array.IndexOf(RowOrder, seat.SeatRow))
            .ThenBy(seat => seat.SeatColumn);
}
