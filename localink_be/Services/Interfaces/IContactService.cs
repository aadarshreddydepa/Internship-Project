public interface IContactService
{
    Task AddContactAsync(RegisterBusinessDto dto, long businessId);
    Task<BusinessContact?> UpdateContactAsync(long businessId, BusinessContact updated);
    Task<bool> DeleteContactAsync(int contactId);
    Task<object?> GetContactByBusinessIdAsync(long businessId);
}
