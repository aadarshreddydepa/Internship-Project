using Microsoft.EntityFrameworkCore;

public class BusinessService : IBusinessService
{
    private readonly AppDbContext _db;
    private readonly IContactService _contactService;
    private readonly IHoursService _hoursService;
    private readonly IPhotoService _photoService;
    private readonly IEmailService _emailService;
    public BusinessService(AppDbContext db,
                           IContactService contactService,
                           IHoursService hoursService,
                           IPhotoService photoService,
                           IEmailService emailService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _contactService = contactService;
        _hoursService = hoursService;
        _photoService = photoService;
        _emailService = emailService;
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
                CategoryName = b.Category.CategoryName,
                SubcategoryName = b.Subcategory.SubcategoryName,
                PrimaryImage = _db.BusinessPhotos
                    .Where(p => p.BusinessId == b.BusinessId && p.IsPrimary)
                    .Select(p => p.ImageUrl)
                    .FirstOrDefault(),
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
        var business = await _db.Businesses
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

        return business;
    }

    public async Task<bool> UpdateBusinessFullAsync(long id, UpdateBusinessDto dto)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business == null) return false;

        business.BusinessName = dto.BusinessName;
        business.Description = dto.Description;
        business.CategoryId = dto.CategoryId;
        business.SubcategoryId = dto.SubcategoryId;

        var contact = await _db.BusinessContacts
            .FirstOrDefaultAsync(c => c.BusinessId == id);

        if (contact != null)
        {
            contact.PhoneCode = dto.PhoneCode;
            contact.PhoneNumber = dto.PhoneNumber;
            contact.Email = dto.Email;
            contact.City = dto.City;
            contact.State = dto.State;
            contact.Country = dto.Country;
            contact.Pincode = dto.Pincode;
            contact.StreetAddress = dto.StreetAddress;
        }

        await _db.SaveChangesAsync();
        return true;
    }
    public async Task<bool> DeleteBusinessAsync(long id)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business == null) return false;

        _db.Businesses.Remove(business);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<long> RegisterBusinessAsync(RegisterBusinessDto dto, long userId)
    {
        using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var category = await _db.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                throw new Exception("Invalid category");

            var subcategory = await _db.Subcategories
                .FirstOrDefaultAsync(s => s.SubcategoryId == dto.SubcategoryId &&
                                        s.CategoryId == dto.CategoryId);

            if (subcategory == null)
                throw new Exception("Invalid subcategory");
            var business = new Business
            {
                BusinessName = dto.BusinessName,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                SubcategoryId = dto.SubcategoryId,
                UserId = userId, 
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

            // ADMIN DASHBOARD ENTRY
            await _db.AdminDashboards.AddAsync(new AdminDashboard
            {
                BusinessId = business.BusinessId,
                Status = BusinessStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            await transaction.CommitAsync();
            // GET BUSINESS DETAILS FOR EMAIL
            var contact = await _db.BusinessContacts
                .Where(c => c.BusinessId == business.BusinessId)
                .FirstOrDefaultAsync();

            var categoryName = await _db.Categories
                .Where(c => c.CategoryId == business.CategoryId)
                .Select(c => c.CategoryName)
                .FirstOrDefaultAsync();

            // ADMIN EMAIL FROM CONFIG
            var adminEmail = "aadarshreddydepa@gmail.com"; // move to config later

            await _emailService.SendNewBusinessNotificationToAdminAsync(
                adminEmail,
                business.BusinessName,
                categoryName ?? "",
                business.Description ?? "",
                contact?.City + ", " + contact?.State,
                contact?.PhoneCode + contact?.PhoneNumber,
                contact?.Email
            );

            return business.BusinessId;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task<object?> GetBusinessPreviewAsync(long businessId)
    {
        var business = await _db.Businesses.FirstOrDefaultAsync(b => b.BusinessId == businessId);
        if (business == null) return null;

        var category = await _db.Categories
            .Where(c => c.CategoryId == business.CategoryId)
            .Select(c => c.CategoryName)
            .FirstOrDefaultAsync();

        var subcategory = await _db.Subcategories
            .Where(s => s.SubcategoryId == business.SubcategoryId)
            .Select(s => s.SubcategoryName)
            .FirstOrDefaultAsync();

        var contact = await _db.BusinessContacts
            .Where(c => c.BusinessId == businessId)
            .FirstOrDefaultAsync();

        var hours = await _db.BusinessHours
            .Where(h => h.BusinessId == businessId)
            .Select(h => new
            {
                h.DayOfWeek,
                h.Mode,
                Slots = _db.BusinessHourSlots
                    .Where(s => s.BusinessHourId == h.BusinessHourId)
                    .Select(s => new { s.OpenTime, s.CloseTime })
                    .ToList()
            }).ToListAsync();

        var photos = await _db.BusinessPhotos
            .Where(p => p.BusinessId == businessId)
            .OrderByDescending(p => p.IsPrimary)
            .Select(p => new { p.PhotoId, p.ImageUrl, p.IsPrimary })
            .ToListAsync();

        return new
        {
            BusinessInformation = new
            {
                business.BusinessName,
                business.Description,
                Category = category,
                Subcategory = subcategory
            },
            ContactDetails = contact == null ? null : new
            {
                contact.PhoneCode,
                contact.PhoneNumber,
                contact.Email,
                contact.Website,
                contact.StreetAddress,
                contact.City,
                contact.State,
                contact.Country,
                contact.Pincode
            },
            BusinessHours = hours,
            BusinessPhotos = photos
        };
    }


    public async Task<List<BusinessDto>> GetBusinessesByUserAsync(long userId)
    {
        if (userId <= 0)
            throw new ArgumentException("UserId must be greater than 0");

        try
        {
            return await _db.Businesses
                .Where(b => b.UserId == userId)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName,
                    Description = b.Description,
                    CategoryName = b.Category != null ? b.Category.CategoryName : "",
                    SubcategoryName = b.Subcategory != null ? b.Subcategory.SubcategoryName : "",
                    SubcategoryId = b.SubcategoryId,

                    PhoneNumber = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => (c.PhoneCode ?? "") + " " + (c.PhoneNumber ?? ""))
                        .FirstOrDefault(),

                    Email = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Email)
                        .FirstOrDefault(),

                    City = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.City)
                        .FirstOrDefault(),

                    Status = _db.AdminDashboards
                        .Where(a => a.BusinessId == b.BusinessId)
                        .Select(a => a.Status.ToString())
                        .FirstOrDefault(),
                    State = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.State)
                        .FirstOrDefault(),

                    Country = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Country)
                        .FirstOrDefault(),

                    Pincode = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Pincode)
                        .FirstOrDefault(),

                    StreetAddress = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.StreetAddress)
                        .FirstOrDefault(),
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching businesses for userId {userId}", ex);
        }
    }

    public async Task<List<BusinessDto>> GetBySubcategoryAsync(int subcategoryId)
    {
        if (subcategoryId <= 0)
            throw new ArgumentException("SubcategoryId must be greater than 0");

        try
        {
            return await _db.Businesses
                .Where(b => b.SubcategoryId == subcategoryId)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName,
                    Description = b.Description,
                    CategoryName = b.Category.CategoryName,
                    SubcategoryId = b.SubcategoryId,
                    SubcategoryName = b.Subcategory.SubcategoryName,

                    PhoneNumber = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.PhoneNumber)
                        .FirstOrDefault(),

                    Email = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Email)
                        .FirstOrDefault(),

                    City = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.City)
                        .FirstOrDefault(),

                    State = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.State)
                        .FirstOrDefault(),

                    PrimaryImage = _db.BusinessPhotos
                        .Where(p => p.BusinessId == b.BusinessId && p.IsPrimary)
                        .Select(p => p.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching businesses for subcategoryId {subcategoryId}", ex);
        }
    }

    public async Task<BusinessDto?> GetByIdAsync(long id)
    {
        if (id <= 0)
            throw new ArgumentException("Business Id must be greater than 0");

        try
        {
            var business = await _db.Businesses
                .Where(b => b.BusinessId == id)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName,
                    Description = b.Description,
                    CategoryName = b.Category.CategoryName,
                    SubcategoryId = b.SubcategoryId,
                    SubcategoryName = b.Subcategory.SubcategoryName,

                    PhoneNumber = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.PhoneNumber)
                        .FirstOrDefault(),

                    Email = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Email)
                        .FirstOrDefault(),

                    City = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.City)
                        .FirstOrDefault(),

                    State = _db.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.State)
                        .FirstOrDefault(),

                    PrimaryImage = _db.BusinessPhotos
                        .Where(p => p.BusinessId == b.BusinessId && p.IsPrimary)
                        .Select(p => p.ImageUrl)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (business == null)
                throw new KeyNotFoundException($"Business with Id {id} not found");

            return business;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching business with Id {id}", ex);
        }
    }
    
    public async Task<List<BusinessDto>> SearchBusinessesAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<BusinessDto>();

        query = query.Trim();

        var businesses = await _db.Businesses
            .AsNoTracking()
            .Where(b =>
                (
                     EF.Functions.Like(b.BusinessName, $"%{query}%") ||
                    (b.Description != null && EF.Functions.Like(b.Description, $"%{query}%")) ||
                    (b.Category != null && EF.Functions.Like(b.Category.CategoryName, $"%{query}%")) ||
                    (b.Subcategory != null && EF.Functions.Like(b.Subcategory.SubcategoryName, $"%{query}%"))
                )
            )

            .Select(b => new BusinessDto
            {
                Id = b.BusinessId,
                Name = b.BusinessName,
                Description = b.Description,

                CategoryName = b.Category != null ? b.Category.CategoryName : "",
                SubcategoryName = b.Subcategory != null ? b.Subcategory.SubcategoryName : "",

                SubcategoryId = b.SubcategoryId,
                PhoneNumber = _db.BusinessContacts
                    .Where(c => c.BusinessId == b.BusinessId)
                    .Select(c => c.PhoneNumber)
                    .FirstOrDefault(),

                Email = _db.BusinessContacts
                    .Where(c => c.BusinessId == b.BusinessId)
                    .Select(c => c.Email)
                    .FirstOrDefault(),

                City = _db.BusinessContacts
                    .Where(c => c.BusinessId == b.BusinessId)
                    .Select(c => c.City)
                    .FirstOrDefault(),

                State = _db.BusinessContacts
                    .Where(c => c.BusinessId == b.BusinessId)
                    .Select(c => c.State)
                    .FirstOrDefault(),
                Status = _db.AdminDashboards
                    .Where(a => a.BusinessId == b.BusinessId)
                    .Select(a => a.Status.ToString())
                    .FirstOrDefault(),
                PrimaryImage = _db.BusinessPhotos
                    .Where(p => p.BusinessId == b.BusinessId && p.IsPrimary)
                    .Select(p => p.ImageUrl)
                    .FirstOrDefault()
            })
            .Take(10)
            .ToListAsync();

        return businesses;
    }
}