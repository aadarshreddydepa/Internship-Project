public interface IContactService
{
    Task AddContactAsync(RegisterBusinessDto dto, long businessId);
    Task<BusinessContact?> UpdateContactAsync(long businessId, BusinessContact updated);
    Task<bool> DeleteContactAsync(long contactId);
    Task<object?> GetContactByBusinessIdAsync(long businessId);
}
