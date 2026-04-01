using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using localink_be.Services.Interfaces;

namespace localink_be.Controllers
{
    [ApiController]
    [Route("api/v1/business/{businessId}/photos")]
    public class PhotoController : ControllerBase
    {
        private readonly IPhotoService _photoService;

        public PhotoController(IPhotoService photoService)
        {
            _photoService = photoService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadPhoto(long businessId, IFormFile file)
        {
            var result = await _photoService.UploadPhotoAsync(businessId, file);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetPhotos(long businessId)
        {
            var photos = await _photoService.GetPhotosAsync(businessId);
            return Ok(photos);
        }

        [HttpDelete("~/api/v1/photos/{photoId}")]
        public async Task<IActionResult> DeletePhoto(long photoId)
        {
            var deleted = await _photoService.DeletePhotoAsync(photoId);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
