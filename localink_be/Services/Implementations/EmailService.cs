using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    // OTP EMAIL
    public async Task SendOtpEmailAsync(string toEmail, string otp)
    {
        var subject = "Password Reset OTP - Localink";
        var body = GetOtpTemplate(otp);

        await SendEmailAsync(toEmail, subject, body);
    }

    // WELCOME EMAIL
    public async Task SendWelcomeEmailAsync(string toEmail, string name)
    {
        var subject = "Welcome to Localink!";
        var body = GetWelcomeTemplate(name);

        await SendEmailAsync(toEmail, subject, body);
    }

    // COMMON EMAIL METHOD
    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(
                _config["Email:AppName"],
                _config["Email:From"]
            ));

            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new BodyBuilder
            {
                HtmlBody = htmlBody
            }.ToMessageBody();

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                _config["Email:Host"],
                int.Parse(_config["Email:Port"]),
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                _config["Email:Username"],
                _config["Email:Password"]
            );

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email failed for {Email}", toEmail);
            throw new Exception("Email service failed");
        }
    }

    private string GetWelcomeTemplate(string name)
    {
        return $@"
        <div style='font-family: Arial; padding:20px'>
            <h2 style='color:#2d89ef'>Welcome to Localink, {name}! </h2>
            <p>We're excited to have you onboard.</p>
            <p>Start exploring businesses and grow your network </p>
            <hr/>
            <small>Localink Team</small>
        </div>";
    }

    // TEMPLATE
    private string GetOtpTemplate(string otp)
    {
        return $@"
        <div style='font-family: Arial; padding:20px'>
            <h2>Password Reset OTP</h2>
            <p>Your OTP is:</p>
            <div style='font-size:28px;font-weight:bold;color:#2d89ef'>
                {otp}
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <hr/>
            <small>Localink Security Team</small>
        </div>";
    }

    public async Task SendNewBusinessNotificationToAdminAsync(
        string adminEmail,
        string businessName,
        string category,
        string description,
        string address,
        string phone,
        string email)
    {
        var subject = "🚀 New Business Registration - Action Required";

        var body = $@"
        <div style='font-family: Arial; padding:20px'>
            <h2>New Business Registration</h2>

            <p>A new business has been registered and is pending approval.</p>

            <hr/>

            <b>Business Name:</b> {businessName} <br/>
            <b>Category:</b> {category} <br/>
            <b>Description:</b> {description} <br/><br/>

            <b>Address:</b> {address} <br/>
            <b>Phone:</b> {phone} <br/>
            <b>Email:</b> {email} <br/>

            <hr/>

            <p><b>Status:</b> Pending Approval</p>

            <p>Please review it from the admin dashboard.</p>

            <small>Localink System</small>
        </div>";

        await SendEmailAsync(adminEmail, subject, body);
    }

    public async Task SendBusinessStatusUpdateToUserAsync(
        string userEmail,
        string ownerName,
        string businessName,
        string category,
        string status,
        string? rejectionReason)
    {
        string subject;
        string body;

        if (status == "Approved")
        {
            subject = "🎉 Your Business Has Been Approved!";

            body = $@"
            <div style='font-family: Arial; padding:20px'>
                <h2>Congratulations {ownerName}! 🎉</h2>

                <p>Your business has been approved.</p>

                <hr/>

                <b>Business Name:</b> {businessName} <br/>
                <b>Category:</b> {category} <br/>
                <b>Status:</b> Approved <br/>

                <hr/>

                <p>You can now start getting customers.</p>

                <small>Localink Team</small>
            </div>";
        }
        else
        {
            subject = "❌ Business Registration Update";

            body = $@"
            <div style='font-family: Arial; padding:20px'>
                <h2>Hello {ownerName},</h2>

                <p>Your business was reviewed but not approved.</p>

                <hr/>

                <b>Business Name:</b> {businessName} <br/>
                <b>Category:</b> {category} <br/>
                <b>Status:</b> Rejected <br/>

                <p><b>Reason:</b> {rejectionReason}</p>

                <hr/>

                <p>Please update and resubmit.</p>

                <small>Localink Team</small>
            </div>";
        }

        await SendEmailAsync(userEmail, subject, body);
    }
}