namespace NatureMiniPlex.Web.Services;

public class PosterFiles
{
    public const long MaxBytes = 2 * 1024 * 1024;
    private static readonly HashSet<string> Extensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private readonly string _folder;

    public PosterFiles(IWebHostEnvironment env)
    {
        var root = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _folder = Path.Combine(root, "posters");
    }

    public async Task<(string? FileName, string? Error)> SaveAsync(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxBytes)
        {
            return (null, "รูปต้องมีขนาดไม่เกิน 2 MB");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!Extensions.Contains(extension))
        {
            return (null, "รับเฉพาะไฟล์ jpg, png หรือ webp");
        }

        Directory.CreateDirectory(_folder);
        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        await using var stream = File.Create(Path.Combine(_folder, fileName));
        await file.CopyToAsync(stream);
        return (fileName, null);
    }

    public void Delete(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return;
        }

        var path = Path.Combine(_folder, Path.GetFileName(fileName));
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }
}
