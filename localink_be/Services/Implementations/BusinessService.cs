using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using localink_be.Data;
using localink_be.Models.Entities;
using localink_be.Models.DTOs;
using localink_be.Services.Interfaces;

namespace localink_be.Services.Implementations
{
    public class BusinessService : IBusinessService
    {
        private readonly AppDbContext _db;
        private readonly IContactService _contactService;
        private readonly IHoursService _hoursService;
        private readonly IPhotoService _photoService;

        public BusinessService(AppDbContext db,
                               IContactService contactService,
                               IHoursService hoursService,
                               IPhotoService photoService)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _contactService = contactService;
            _hoursService = hoursService;
            _photoService = photoService;
        }

        public async Task<List<object>> GetAllBusinessesAsync()
        {
            return await _db.Businesses
                .Select(b => new
                {
                    b.BusinessId,
                    b.BusinessName,
                    b.Description,
                    b.CategoryId,
                    b.SubcategoryId,
                    b.CreatedAt
                })
                .ToListAsync<object>();
        }

        public async Task<Business> CreateBusinessAsync(Business dto)
        {
            _db.Businesses.Add(dto);
            await _db.SaveChangesAsync();
            return dto;
        }

        public async Task<object?> GetBusinessByIdAsync(long id)
        {
            return await _db.Businesses
                .Where(b => b.BusinessId == id)
                .Select(b => new
                {
                    b.BusinessId,
                    b.BusinessName,
                    b.Description,
                    b.CategoryId,
                    b.SubcategoryId,
                    Contact = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => new
                        {
                            c.PhoneCode,
                            c.PhoneNumber,
                            c.Email,
                            c.Website,
                            c.StreetAddress,
                            c.City,
                            c.State,
                            c.Country,
                            c.Pincode
                        })
                        .FirstOrDefault(),
                    Photos = _db.BusinessPhotos
                        .Where(p => p.BusinessId == b.BusinessId)
                        .Select(p => new
                        {
                            p.ImageUrl,
                            p.IsPrimary
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<Business?> UpdateBusinessAsync(long id, Business updated)
        {
            var existing = await _db.Businesses.FindAsync(id);
            if (existing == null) return null;

            existing.BusinessName = updated.BusinessName;
            existing.Description = updated.Description;
            existing.CategoryId = updated.CategoryId;
            existing.SubcategoryId = updated.SubcategoryId;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteBusinessAsync(long id)
        {
            var business = await _db.Businesses.FindAsync(id);
            if (business == null) return false;

            _db.Businesses.Remove(business);
            await _db.SaveChangesAsync();
            return true;
        }

        // ✅ FIXED METHOD
        public async Task<long> RegisterBusinessAsync(RegisterBusinessDto dto)
        {
            var strategy = _db.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _db.Database.BeginTransactionAsync();

                try
                {
                    // Validate Category
                    var category = await _db.Categories.FindAsync(dto.CategoryId);
                    if (category == null)
                        throw new Exception("Invalid category");

                    // Validate Subcategory
                    var subcategory = await _db.Subcategories
                        .FirstOrDefaultAsync(s => s.SubcategoryId == dto.SubcategoryId &&
                                                  s.CategoryId == dto.CategoryId);

                    if (subcategory == null)
                        throw new Exception("Invalid subcategory");

                    // Create Business
                    var business = new Business
                    {
                        BusinessName = dto.BusinessName,
                        Description = dto.Description,
                        CategoryId = dto.CategoryId,
                        SubcategoryId = dto.SubcategoryId,
                        UserId = dto.UserId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _db.Businesses.Add(business);
                    await _db.SaveChangesAsync();

                    // CONTACT
                    await _contactService.AddContactAsync(dto, business.BusinessId);

                    // HOURS
                    await _hoursService.AddHoursAsync(dto.Hours, business.BusinessId);

                    // PHOTO
                    if (!string.IsNullOrWhiteSpace(dto.Photo))
                    {
                        if (dto.Photo.Length > 5_000_000)
                            throw new Exception("Image too large");

                        await _photoService.SavePhotoAsync(dto.Photo, business.BusinessId);
                    }

                    await transaction.CommitAsync();
                    return business.BusinessId;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<object?> GetBusinessPreviewAsync(long businessId)
        {
            var business = await _db.Businesses.FirstOrDefaultAsync(b => b.BusinessId == businessId);
            if (business == null) return null;

            return new
            {
                business.BusinessName,
                business.Description
            };
        }

        public async Task<List<BusinessDto>> GetBusinessesByUserAsync(long userId)
        {
            return await _db.Businesses
                .Where(b => b.UserId == userId)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName
                })
                .ToListAsync();
        }

        public async Task<List<BusinessDto>> GetBySubcategoryAsync(int subcategoryId)
        {
            return await _db.Businesses
                .Where(b => b.SubcategoryId == subcategoryId)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName
                })
                .ToListAsync();
        }

        public async Task<BusinessDto?> GetByIdAsync(long id)
        {
            return await _db.Businesses
                .Where(b => b.BusinessId == id)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName
                })
                .FirstOrDefaultAsync();
        }
    }
}