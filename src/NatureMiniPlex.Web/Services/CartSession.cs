using System.Text.Json;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Services;

public static class CartSession
{
    private const string Key = "booking-cart";

    public static List<CartLine> Get(ISession session)
    {
        var json = session.GetString(Key);
        if (string.IsNullOrEmpty(json))
        {
            return [];
        }

        return JsonSerializer.Deserialize<List<CartLine>>(json) ?? [];
    }

    public static void Save(ISession session, List<CartLine> lines) =>
        session.SetString(Key, JsonSerializer.Serialize(lines));

    public static void Clear(ISession session) => session.Remove(Key);
}
