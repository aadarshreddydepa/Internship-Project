using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class HoursServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"HoursDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        private void SeedBusiness(AppDbContext db)
        {
            db.Users.Add(new User
            {
                UserId = 1, AccountType = "client", FullName = "John",
                Email = "j@t.com", PasswordHash = "h", CountryCode = "+91"
            });
            db.Categories.Add(new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "i.png" });
            db.Subcategories.Add(new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast" });
            db.Businesses.Add(new Business
            {
                BusinessId = 1, BusinessName = "Biz", Description = "Test business description",
                CategoryId = 1, SubcategoryId = 1, UserId = 1,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
        }

        // ──── CreateOrReplaceBusinessHoursAsync ────

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_ReturnsTrue_WhenSuccess()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var dto = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Monday", Mode = "24h", Slots = new List<TimeSlotDto>() },
                    new DayHoursDto { DayOfWeek = "Tuesday", Mode = "closed", Slots = new List<TimeSlotDto>() }
                }
            };

            // Act
            var result = await service.CreateOrReplaceBusinessHoursAsync(1, dto);

            // Assert
            result.Should().BeTrue();
            (await db.BusinessHours.CountAsync()).Should().Be(2);
        }

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_ReturnsFalse_WhenBusinessNotExists()
        {
            // Arrange
            var db = GetDbContext();
            var service = new HoursService(db);
            var dto = new BusinessHoursDto { Days = new List<DayHoursDto>() };

            // Act
            var result = await service.CreateOrReplaceBusinessHoursAsync(999, dto);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_CreatesSlots_WhenCustomMode()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var dto = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto
                    {
                        DayOfWeek = "Wednesday",
                        Mode = "custom",
                        Slots = new List<TimeSlotDto>
                        {
                            new TimeSlotDto { OpenTime = new TimeSpan(9, 0, 0), CloseTime = new TimeSpan(12, 0, 0) },
                            new TimeSlotDto { OpenTime = new TimeSpan(14, 0, 0), CloseTime = new TimeSpan(18, 0, 0) }
                        }
                    }
                }
            };

            // Act
            var result = await service.CreateOrReplaceBusinessHoursAsync(1, dto);

            // Assert
            result.Should().BeTrue();
            (await db.BusinessHourSlots.CountAsync()).Should().Be(2);
        }

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_ThrowsException_WhenCustomModeWithNoSlots()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var dto = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Thursday", Mode = "custom", Slots = new List<TimeSlotDto>() }
                }
            };

            // Act & Assert
            var act = () => service.CreateOrReplaceBusinessHoursAsync(1, dto);
            await act.Should().ThrowAsync<ArgumentException>().WithMessage("Slots required*");
        }

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_ThrowsException_WhenSlotsOverlap()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var dto = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto
                    {
                        DayOfWeek = "Friday",
                        Mode = "custom",
                        Slots = new List<TimeSlotDto>
                        {
                            new TimeSlotDto { OpenTime = new TimeSpan(9, 0, 0), CloseTime = new TimeSpan(14, 0, 0) },
                            new TimeSlotDto { OpenTime = new TimeSpan(13, 0, 0), CloseTime = new TimeSpan(18, 0, 0) }
                        }
                    }
                }
            };

            // Act & Assert
            var act = () => service.CreateOrReplaceBusinessHoursAsync(1, dto);
            await act.Should().ThrowAsync<ArgumentException>().WithMessage("Overlapping slots*");
        }

        // ──── GetBusinessHoursAsync ────

        [Fact]
        public async Task GetBusinessHoursAsync_ReturnsHours_WhenExist()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            db.BusinessHours.Add(new BusinessHour
            {
                BusinessHourId = 1, BusinessId = 1, DayOfWeek = "Monday", Mode = "24h"
            });
            await db.SaveChangesAsync();

            var service = new HoursService(db);

            // Act
            var result = await service.GetBusinessHoursAsync(1);

            // Assert
            result.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetBusinessHoursAsync_ReturnsEmptyList_WhenNoHours()
        {
            // Arrange
            var db = GetDbContext();
            var service = new HoursService(db);

            // Act
            var result = await service.GetBusinessHoursAsync(999);

            // Assert
            result.Should().BeEmpty();
        }

        // ──── AddHoursAsync ────

        [Fact]
        public async Task AddHoursAsync_AddsHoursWithSlots()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var hours = new List<DayHoursDto>
            {
                new DayHoursDto
                {
                    DayOfWeek = "Saturday",
                    Mode = "custom",
                    Slots = new List<TimeSlotDto>
                    {
                        new TimeSlotDto { OpenTime = new TimeSpan(10, 0, 0), CloseTime = new TimeSpan(15, 0, 0) }
                    }
                }
            };

            // Act
            await service.AddHoursAsync(hours, 1);

            // Assert
            (await db.BusinessHours.CountAsync()).Should().Be(1);
            (await db.BusinessHourSlots.CountAsync()).Should().Be(1);
        }

        // ──── Edge Case Tests ────

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_ReplacesExistingHours()
        {
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);

            // First set of hours
            var dto1 = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Monday", Mode = "24h", Slots = new List<TimeSlotDto>() },
                    new DayHoursDto { DayOfWeek = "Tuesday", Mode = "closed", Slots = new List<TimeSlotDto>() }
                }
            };
            await service.CreateOrReplaceBusinessHoursAsync(1, dto1);
            (await db.BusinessHours.CountAsync()).Should().Be(2);

            // Replace with new hours
            var dto2 = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Wednesday", Mode = "24h", Slots = new List<TimeSlotDto>() }
                }
            };
            var result = await service.CreateOrReplaceBusinessHoursAsync(1, dto2);

            result.Should().BeTrue();
            (await db.BusinessHours.CountAsync()).Should().Be(1);
            var hour = await db.BusinessHours.FirstAsync();
            hour.DayOfWeek.Should().Be("Wednesday");
        }

        [Fact]
        public async Task AddHoursAsync_AddsHoursWithClosedMode()
        {
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var hours = new List<DayHoursDto>
            {
                new DayHoursDto { DayOfWeek = "Sunday", Mode = "closed", Slots = new List<TimeSlotDto>() }
            };

            await service.AddHoursAsync(hours, 1);

            (await db.BusinessHours.CountAsync()).Should().Be(1);
            var hour = await db.BusinessHours.FirstAsync();
            hour.Mode.Should().Be("closed");
            (await db.BusinessHourSlots.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task AddHoursAsync_AddsHoursWith24hMode()
        {
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var hours = new List<DayHoursDto>
            {
                new DayHoursDto { DayOfWeek = "Monday", Mode = "24h", Slots = new List<TimeSlotDto>() }
            };

            await service.AddHoursAsync(hours, 1);

            (await db.BusinessHours.CountAsync()).Should().Be(1);
            var hour = await db.BusinessHours.FirstAsync();
            hour.Mode.Should().Be("24h");
        }

        [Fact]
        public async Task CreateOrReplaceBusinessHoursAsync_ThrowsException_WhenCustomModeWithNullSlots()
        {
            var db = GetDbContext();
            SeedBusiness(db);
            var service = new HoursService(db);
            var dto = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Monday", Mode = "custom", Slots = null! }
                }
            };

            var act = () => service.CreateOrReplaceBusinessHoursAsync(1, dto);
            await act.Should().ThrowAsync<ArgumentException>();
        }
    }
}

