using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/business/{businessId}/photos")]
public class PhotoController : ControllerBase
{
    private readonly IPhotoService _photoService;

    public PhotoController(IPhotoService photoService)
    {
        _photoService = photoService;
    }

    // POST: api/business/{businessId}/photos
    [HttpPost]
    public async Task<IActionResult> UploadPhoto(long businessId, IFormFile file)
    {
        var result = await _photoService.UploadPhotoAsync(businessId, file);
        return Ok(result);
    }

    // GET: api/business/{businessId}/photos
    [HttpGet]
    public async Task<IActionResult> GetPhotos(long businessId)
    {
        var photos = await _photoService.GetPhotosAsync(businessId);
        return Ok(photos);
    }

    // DELETE: api/photos/{photoId}
    [HttpDelete("~/api/v1/photos/{photoId}")]
    public async Task<IActionResult> DeletePhoto(long photoId)
    {
        var deleted = await _photoService.DeletePhotoAsync(photoId);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
