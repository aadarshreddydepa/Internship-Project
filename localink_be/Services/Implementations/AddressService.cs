using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using localink_be.Data;
using localink_be.Models.Entities;
using localink_be.Models.DTOs;
using localink_be.Services.Interfaces;

namespace localink_be.Services.Implementations
{
public class AddressService : IAddressService
{
    private readonly AppDbContext _db;

    public AddressService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AddressDto?> GetAddressByUserId(long userId)
    {
        return await _db.Addresses
            .Where(a => a.UserId == userId)
            .Select(a => new AddressDto
            {
                Street = a.StreetAddress,
                City = a.City,
                State = a.State,
                Country = a.Country,
                Pincode = a.Pincode
            })
            .FirstOrDefaultAsync();
    }
}
}