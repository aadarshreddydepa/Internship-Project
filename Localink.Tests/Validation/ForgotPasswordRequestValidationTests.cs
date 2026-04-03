using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class ForgotPasswordRequestValidationTests
    {
        private List<ValidationResult> Validate(ForgotPasswordRequest model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        [Fact]
        public void ValidRequest_PassesValidation()
        {
            var model = new ForgotPasswordRequest
            {
                Email = "user@test.com",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().BeEmpty();
        }

        [Fact]
        public void MissingEmail_FailsValidation()
        {
            var model = new ForgotPasswordRequest
            {
                Email = "",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }

        [Fact]
        public void InvalidEmailFormat_FailsValidation()
        {
            var model = new ForgotPasswordRequest
            {
                Email = "invalid-email",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }

        [Fact]
        public void ShortPassword_FailsValidation()
        {
            var model = new ForgotPasswordRequest
            {
                Email = "user@test.com",
                NewPassword = "short"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("NewPassword"));
        }
    }
}
