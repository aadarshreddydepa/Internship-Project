public interface IAddressService
{
    Task<AddressDto?> GetAddressByUserId(long userId);
}