namespace NatureMiniPlex.Web.Models;

public sealed class RuleResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = "";

    public static RuleResult Ok(string message) => new() { Success = true, Message = message };

    public static RuleResult Fail(string message) => new() { Success = false, Message = message };
}
