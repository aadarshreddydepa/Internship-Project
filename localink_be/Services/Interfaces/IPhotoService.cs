public interface IPhotoService
{
    Task<BusinessPhoto?> UploadPhotoAsync(long businessId, IFormFile file);
    Task<List<BusinessPhoto>> GetPhotosAsync(long businessId);
    Task<bool> DeletePhotoAsync(long photoId);

    Task SavePhotoAsync(string photoBase64, long businessId);
}
