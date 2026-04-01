using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using localink_be.Data;
using localink_be.Models.Entities;
using localink_be.Services.Interfaces;

namespace localink_be.Services.Implementations
{
    public class PhotoService : IPhotoService
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public PhotoService(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        public async Task<BusinessPhoto?> UploadPhotoAsync(long businessId, IFormFile file)
        {
            var businessExists = await _db.Businesses.AnyAsync(b => b.BusinessId == businessId);
            if (!businessExists) return null;

            if (file == null || file.Length == 0) return null;

            var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var imageUrl = $"/uploads/{fileName}";

            var existingPrimary = await _db.BusinessPhotos
                .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.IsPrimary);

            if (existingPrimary != null)
                existingPrimary.IsPrimary = false;

            var photo = new BusinessPhoto
            {
                BusinessId = businessId,
                ImageUrl = imageUrl,
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.BusinessPhotos.Add(photo);
            await _db.SaveChangesAsync();

            return photo;
        }

        public async Task<List<BusinessPhoto>> GetPhotosAsync(long businessId)
        {
            return await _db.BusinessPhotos
                .Where(p => p.BusinessId == businessId)
                .OrderByDescending(p => p.IsPrimary)
                .ToListAsync();
        }

        public async Task<bool> DeletePhotoAsync(long photoId)
        {
            var photo = await _db.BusinessPhotos.FindAsync(photoId);
            if (photo == null) return false;

            var filePath = Path.Combine(_env.WebRootPath, photo.ImageUrl.TrimStart('/'));
            if (File.Exists(filePath))
                File.Delete(filePath);

            _db.BusinessPhotos.Remove(photo);
            await _db.SaveChangesAsync();

            return true;
        }

        public async Task SavePhotoAsync(string photoBase64, long businessId)
        {
            if (string.IsNullOrWhiteSpace(photoBase64)) return;

            var bytes = Convert.FromBase64String(photoBase64);

            var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}.jpg";
            var filePath = Path.Combine(uploadsPath, fileName);

            await File.WriteAllBytesAsync(filePath, bytes);

            var imageUrl = $"/uploads/{fileName}";

            var photo = new BusinessPhoto
            {
                BusinessId = businessId,
                ImageUrl = imageUrl,
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.BusinessPhotos.Add(photo);
            await _db.SaveChangesAsync();
        }
    }
}
