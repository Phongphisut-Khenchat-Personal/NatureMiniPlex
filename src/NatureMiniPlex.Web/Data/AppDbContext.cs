using Microsoft.EntityFrameworkCore;
using NatureMiniPlex.Web.Models;

namespace NatureMiniPlex.Web.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Cinema> Cinemas => Set<Cinema>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Showtime> Showtimes => Set<Showtime>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingSeat> BookingSeats => Set<BookingSeat>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cinema>(entity =>
        {
            entity.Property(cinema => cinema.CinemaName).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Seat>(entity =>
        {
            entity.Property(seat => seat.SeatRow).HasMaxLength(20).IsRequired();
            entity.Property(seat => seat.SeatColumn).HasMaxLength(1).IsRequired();
            entity.Property(seat => seat.SeatCode).HasMaxLength(20).IsRequired();
            entity.Property(seat => seat.IsClosed).HasDefaultValue(false);
            entity.HasIndex(seat => new { seat.CinemaId, seat.SeatCode }).IsUnique();
            entity.HasOne(seat => seat.Cinema)
                .WithMany(cinema => cinema.Seats)
                .HasForeignKey(seat => seat.CinemaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Movie>(entity =>
        {
            entity.Property(movie => movie.Title).HasMaxLength(200).IsRequired();
            entity.Property(movie => movie.PosterFileName).HasMaxLength(80);
            entity.Property(movie => movie.IsRecommended).HasDefaultValue(false);
        });

        modelBuilder.Entity<Showtime>(entity =>
        {
            entity.HasIndex(show => new { show.CinemaId, show.ShowDate, show.Slot }).IsUnique();
            entity.HasOne(show => show.Cinema)
                .WithMany(cinema => cinema.Showtimes)
                .HasForeignKey(show => show.CinemaId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(show => show.Movie)
                .WithMany(movie => movie.Showtimes)
                .HasForeignKey(show => show.MovieId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.Property(booking => booking.BookingCode).HasMaxLength(40).IsRequired();
            entity.Property(booking => booking.PhoneNumber).HasMaxLength(10).IsRequired();
            entity.HasIndex(booking => booking.BookingCode).IsUnique();
            entity.HasIndex(booking => booking.PhoneNumber);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(user => user.Username).HasMaxLength(50).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(200).IsRequired();
            entity.Property(user => user.Role).HasMaxLength(20).IsRequired();
            entity.HasIndex(user => user.Username).IsUnique();
        });

        modelBuilder.Entity<BookingSeat>(entity =>
        {
            entity.HasOne(item => item.Booking)
                .WithMany(booking => booking.Seats)
                .HasForeignKey(item => item.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.Showtime)
                .WithMany(show => show.BookingSeats)
                .HasForeignKey(item => item.ShowtimeId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.Seat)
                .WithMany(seat => seat.BookingSeats)
                .HasForeignKey(item => item.SeatId)
                .OnDelete(DeleteBehavior.Restrict);

            // ที่นั่งหนึ่งของรอบหนึ่งจองได้ครั้งเดียว เฉพาะแถวที่สถานะยังเป็นจองอยู่
            // พอยกเลิก สถานะไม่ใช่ 0 แถวนั้นหลุดจากดัชนี และที่นั่งเดิมจองใหม่ได้
            entity.HasIndex(item => new { item.ShowtimeId, item.SeatId })
                .IsUnique()
                .HasFilter("[Status] = 0");
        });
    }
}

public static class AppDbContextFactory
{
    public static AppDbContext Create(string connectionString)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;
        return new AppDbContext(options);
    }
}
