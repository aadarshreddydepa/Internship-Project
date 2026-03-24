using Microsoft.EntityFrameworkCore;

public class ContactService : IContactService
{
    private readonly AppDbContext _db;

    public ContactService(AppDbContext db)
    {
        _db = db;
    }

    // ADD CONTACT (used during registration)
    public async Task AddContactAsync(RegisterBusinessDto dto, long businessId)
    {
        if (string.IsNullOrWhiteSpace(dto.PhoneCode) || string.IsNullOrWhiteSpace(dto.PhoneNumber))
            throw new ArgumentException("Phone code and number required");

        var contact = new BusinessContact
        {
            BusinessId = businessId,
            PhoneCode = dto.PhoneCode,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Website = dto.Website,
            StreetAddress = dto.Address,
            City = dto.City,
            State = dto.State,
            Country = dto.Country,
            Pincode = dto.Pincode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.BusinessContacts.Add(contact);
        await _db.SaveChangesAsync();
    }

    // UPDATE CONTACT
    public async Task<BusinessContact?> UpdateContactAsync(long businessId, BusinessContact updated)
    {
        var existing = await _db.BusinessContacts
            .FirstOrDefaultAsync(c => c.BusinessId == businessId);

        if (existing == null) return null;

        existing.PhoneCode = updated.PhoneCode;
        existing.PhoneNumber = updated.PhoneNumber;
        existing.Email = updated.Email;
        existing.Website = updated.Website;
        existing.StreetAddress = updated.StreetAddress;
        existing.City = updated.City;
        existing.State = updated.State;
        existing.Country = updated.Country;
        existing.Pincode = updated.Pincode;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return existing;
    }

    // DELETE CONTACT
    public async Task<bool> DeleteContactAsync(int contactId)
    {
        var contact = await _db.BusinessContacts.FindAsync(contactId);
        if (contact == null) return false;

        _db.BusinessContacts.Remove(contact);
        await _db.SaveChangesAsync();
        return true;
    }

    // GET CONTACT BY BUSINESS ID
    public async Task<object?> GetContactByBusinessIdAsync(long businessId)
    {
        var contact = await _db.BusinessContacts
            .Where(c => c.BusinessId == businessId)
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
            .FirstOrDefaultAsync();

        return contact; // null if not found
    }
}
