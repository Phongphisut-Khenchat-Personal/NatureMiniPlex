using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Data;
using NatureMiniPlex.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<MovieService>();
builder.Services.AddScoped<ScheduleService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(8);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    const int attempts = 15;
    for (var attempt = 1; ; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            await DbSeeder.SeedCinemasAsync(db);
            await DbSeeder.SeedDemoAsync(db);
            break;
        }
        catch (Exception) when (attempt < attempts)
        {
            await Task.Delay(TimeSpan.FromSeconds(2));
        }
    }
}

// หน้าเว็บเป็นภาษาไทย แต่ช่องวันที่ต้องเป็นปี ค.ศ.
// ถ้าใช้ปฏิทิน พ.ศ. ของ th-TH ช่อง date จะกลายเป็น 2569 และบันทึกผิดวัน
var thai = new CultureInfo("th-TH");
thai.DateTimeFormat.Calendar = new GregorianCalendar();
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(thai),
    SupportedCultures = [thai],
    SupportedUICultures = [thai]
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseSession();
app.UseAuthorization();
app.MapStaticAssets();
app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
