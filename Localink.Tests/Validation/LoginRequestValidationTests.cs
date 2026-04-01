using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class LoginRequestValidationTests
    {
        private List<ValidationResult> Validate(LoginRequest model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        [Fact]
        public void ValidRequest_PassesValidation()
        {
            var model = new LoginRequest
            {
                UsernameOrEmail = "user@test.com",
                Password = "Password1",
                CaptchaToken = "token"
            };
            var results = Validate(model);
            results.Should().BeEmpty();
        }

        [Fact]
        public void MissingUsernameOrEmail_FailsValidation()
        {
            var model = new LoginRequest
            {
                UsernameOrEmail = "",
                Password = "Password1",
                CaptchaToken = "token"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("UsernameOrEmail"));
        }

        [Fact]
        public void MissingPassword_FailsValidation()
        {
            var model = new LoginRequest
            {
                UsernameOrEmail = "user@test.com",
                Password = "",
                CaptchaToken = "token"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Password"));
        }

        [Fact]
        public void MissingCaptchaToken_FailsValidation()
        {
            var model = new LoginRequest
            {
                UsernameOrEmail = "user@test.com",
                Password = "Password1",
                CaptchaToken = ""
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("CaptchaToken"));
        }
    }
}
