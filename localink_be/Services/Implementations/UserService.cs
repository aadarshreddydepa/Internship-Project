using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(long userId)
    {
        var user = await _db.Users
            .Where(u => u.UserId == userId)
            .Select(u => new UserProfileDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.PhoneNumber,

                Address = _db.Addresses
                    .Where(a => a.UserId == u.UserId)
                    .Select(a => new AddressDto
                    {
                        Street = a.StreetAddress,
                        City = a.City,
                        State = a.State,
                        Country = a.Country,
                        Pincode = a.Pincode
                    })
                    .FirstOrDefault() ?? new AddressDto()
            })
            .FirstOrDefaultAsync();

        return user;
    }

    public async Task<bool> UpdateUserProfileAsync(long userId, UpdateUserProfileDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return false;
        user.FullName = dto.FullName;
        user.PhoneNumber = dto.Phone;
        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.UserId == userId);

        if (address == null)
        {
            address = new Address
            {
                UserId = userId,
                StreetAddress = dto.Address.Street,
                City = dto.Address.City,
                State = dto.Address.State,
                Country = dto.Address.Country,
                Pincode = dto.Address.Pincode
            };

            _db.Addresses.Add(address);
        }
        else
        {
            address.StreetAddress = dto.Address.Street;
            address.City = dto.Address.City;
            address.State = dto.Address.State;
            address.Country = dto.Address.Country;
            address.Pincode = dto.Address.Pincode;
        }

        await _db.SaveChangesAsync();
        return true;
    }
}