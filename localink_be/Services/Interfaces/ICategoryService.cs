using System.Collections.Generic;
using System.Threading.Tasks;
using localink_be.Models.DTOs;

namespace localink_be.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetCategoriesAsync();
    }
}