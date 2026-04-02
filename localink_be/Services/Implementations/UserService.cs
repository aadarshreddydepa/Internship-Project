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
}