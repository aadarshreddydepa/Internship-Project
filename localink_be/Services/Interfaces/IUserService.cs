public interface IUserService
{
    Task<UserProfileDto?> GetUserProfileAsync(long userId);
    Task<bool> UpdateUserProfileAsync(long userId, UpdateUserProfileDto dto);
}