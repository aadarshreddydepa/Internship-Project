public interface IHoursService
{
    Task<bool> CreateOrReplaceBusinessHoursAsync(long businessId, BusinessHoursDto dto);
    Task<List<object>> GetBusinessHoursAsync(long businessId);
    Task AddHoursAsync(List<DayHoursDto> hours, long businessId);
}
