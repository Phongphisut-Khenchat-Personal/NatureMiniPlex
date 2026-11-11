using Microsoft.AspNetCore.Mvc;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Controllers;

public static class ApiResults
{
    public static IActionResult From(RuleResult result) =>
        result.Success
            ? new OkObjectResult(new { message = result.Message, bookingCode = result.Code })
            : new BadRequestObjectResult(new { message = result.Message });
}
