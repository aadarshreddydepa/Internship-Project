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
    public class ContactService : IContactService
    {
        private readonly AppDbContext _db;

        public ContactService(AppDbContext db)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
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
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.BusinessContacts.Add(contact);
            await _db.SaveChangesAsync();
        }

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
            existing.Latitude = updated.Latitude;
            existing.Longitude = updated.Longitude;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteContactAsync(long contactId)
        {
            var contact = await _db.BusinessContacts.FindAsync(contactId);
            if (contact == null) return false;

            _db.BusinessContacts.Remove(contact);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<object?> GetContactByBusinessIdAsync(long businessId)
        {
            var contact = await _db.BusinessContacts
                .Where(c => c.BusinessId == businessId)
                .Select(c => new
                {
                    c.ContactId,
                    c.BusinessId,
                    c.PhoneCode,
                    c.PhoneNumber,
                    c.Email,
                    c.Website,
                    c.StreetAddress,
                    c.City,
                    c.State,
                    c.Country,
                    c.Pincode,
                    c.Latitude,
                    c.Longitude,
                    c.CreatedAt,
                    c.UpdatedAt
                }).FirstOrDefaultAsync();

            return contact; 
        }
    }
}
