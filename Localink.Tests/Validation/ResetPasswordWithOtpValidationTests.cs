using System.ComponentModel.DataAnnotations;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Validation
{
    public class ResetPasswordWithOtpValidationTests
    {
        private List<ValidationResult> Validate(ResetPasswordWithOtpRequest model)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, results, true);
            return results;
        }

        [Fact]
        public void ValidRequest_PassesValidation()
        {
            var model = new ResetPasswordWithOtpRequest
            {
                Email = "user@test.com",
                Otp = "123456",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().BeEmpty();
        }

        [Fact]
        public void MissingEmail_FailsValidation()
        {
            var model = new ResetPasswordWithOtpRequest
            {
                Email = "",
                Otp = "123456",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }

        [Fact]
        public void MissingOtp_FailsValidation()
        {
            var model = new ResetPasswordWithOtpRequest
            {
                Email = "user@test.com",
                Otp = "",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Otp"));
        }

        [Fact]
        public void ShortPassword_FailsValidation()
        {
            var model = new ResetPasswordWithOtpRequest
            {
                Email = "user@test.com",
                Otp = "123456",
                NewPassword = "short"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("NewPassword"));
        }

        [Fact]
        public void InvalidEmailFormat_FailsValidation()
        {
            var model = new ResetPasswordWithOtpRequest
            {
                Email = "not-valid",
                Otp = "123456",
                NewPassword = "NewPassword1"
            };
            var results = Validate(model);
            results.Should().Contain(r => r.MemberNames.Contains("Email"));
        }
    }
}
