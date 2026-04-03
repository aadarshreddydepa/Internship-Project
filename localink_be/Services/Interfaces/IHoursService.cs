using System.Collections.Generic;
using System.Threading.Tasks;
using localink_be.Models.DTOs;

namespace localink_be.Services.Interfaces
{
    public interface IHoursService
    {
        Task<bool> CreateOrReplaceBusinessHoursAsync(long businessId, BusinessHoursDto dto);
        Task<List<object>> GetBusinessHoursAsync(long businessId);
        Task AddHoursAsync(List<DayHoursDto> hours, long businessId);
    }
}
