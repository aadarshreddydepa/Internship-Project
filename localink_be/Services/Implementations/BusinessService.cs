using Microsoft.EntityFrameworkCore;

public class BusinessService : IBusinessService
{
    private readonly AppDbContext _context;

    public BusinessService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<List<BusinessDto>> GetBusinessesByUserAsync(long userId)
    {
        if (userId <= 0)
            throw new ArgumentException("UserId must be greater than 0");

        try
        {
            var businesses = await _context.Businesses
                .Where(b => b.UserId == userId)
                .Select(b => new BusinessDto
                {
                    BusinessId = b.BusinessId,
                    BusinessName = b.BusinessName,
                    Description = b.Description,

                    Category = b.Category.CategoryName,
                    Subcategory = b.Subcategory.SubcategoryName,

                    // Admin Status
                    Status = _context.AdminDashboards
                        .Where(a => a.BusinessId == b.BusinessId)
                        .Select(a => a.Status)
                        .FirstOrDefault(),

                    // Contact Details
                    Phone = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.PhoneCode + " " + c.PhoneNumber)
                        .FirstOrDefault(),

                    Email = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Email)
                        .FirstOrDefault(),

                    City = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.City)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return businesses;
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
            var businesses = await _context.Businesses
                .Where(b => b.SubcategoryId == subcategoryId)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName,
                    Description = b.Description,
                    CategoryName = b.Category.CategoryName,
                    SubcategoryId = b.SubcategoryId,
                    SubcategoryName = b.Subcategory.SubcategoryName,

                    PhoneNumber = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.PhoneNumber)
                        .FirstOrDefault(),

                    Email = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Email)
                        .FirstOrDefault(),

                    City = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.City)
                        .FirstOrDefault(),

                    State = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.State)
                        .FirstOrDefault(),

                    PrimaryImage = _context.BusinessPhotos
                        .Where(p => p.BusinessId == b.BusinessId && p.IsPrimary)
                        .Select(p => p.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return businesses;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching businesses for subcategoryId {subcategoryId}", ex);
        }
    }

    public async Task<List<BusinessDto>> GetBusinessesByUserAsync(long userId)
    {
        if (userId <= 0)
            throw new ArgumentException("UserId must be greater than 0");

        try
        {
            return await _context.Businesses
                .Where(b => b.UserId == userId)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName,
                    Description = b.Description,
                    CategoryName = b.Category.CategoryName,
                    SubcategoryId = b.SubcategoryId,
                    SubcategoryName = b.Subcategory.SubcategoryName
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching businesses for userId {userId}", ex);
        }
    }

    public async Task<BusinessDto?> GetByIdAsync(long id)
    {
        if (id <= 0)
            throw new ArgumentException("Business Id must be greater than 0");

        try
        {
            var business = await _context.Businesses
                .Where(b => b.BusinessId == id)
                .Select(b => new BusinessDto
                {
                    Id = b.BusinessId,
                    Name = b.BusinessName,
                    Description = b.Description,
                    CategoryName = b.Category.CategoryName,
                    SubcategoryId = b.SubcategoryId,
                    SubcategoryName = b.Subcategory.SubcategoryName,

                    PhoneNumber = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.PhoneNumber)
                        .FirstOrDefault(),

                    Email = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.Email)
                        .FirstOrDefault(),

                    City = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.City)
                        .FirstOrDefault(),

                    State = _context.BusinessContacts
                        .Where(c => c.BusinessId == b.BusinessId)
                        .Select(c => c.State)
                        .FirstOrDefault(),

                    PrimaryImage = _context.BusinessPhotos
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
}