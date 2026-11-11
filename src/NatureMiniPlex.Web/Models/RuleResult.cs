namespace NatureMiniPlex.Web.Models;

public sealed class RuleResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = "";
    public string? Code { get; init; }

    public static RuleResult Ok(string message, string? code = null) => new() { Success = true, Message = message, Code = code };

    public static RuleResult Fail(string message) => new() { Success = false, Message = message };
}
