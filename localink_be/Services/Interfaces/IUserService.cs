public interface IUserService
{
    Task<UserProfileDto?> GetUserProfileAsync(long userId);
}