using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using localink_be.Hubs;
using System.Text;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddHttpClient();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure()
    )
);


builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ISubcategoryService, SubcategoryService>();
builder.Services.AddScoped<IBusinessService, BusinessService>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddScoped<IHoursService, HoursService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddHttpClient<BusinessLocationService>();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddScoped<IBusinessPincodeService, BusinessPincodeService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ICaptchaService, CaptchaService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        )
    };
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();




var key = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(key))
    throw new Exception("JWT Key is missing in configuration!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // FIX: Disable HTTPS metadata in development
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        )
    };
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Localink API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter: Bearer {your JWT token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
<<<<<<< HEAD
    options.AddPolicy("AllowAll", policy =>
    {
        policy
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
    });
=======
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:4200")
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader());
>>>>>>> origin/feature/dev-3
});

var app = builder.Build();

<<<<<<< HEAD


// Global Exception Middleware FIRST
app.UseMiddleware<ExceptionMiddleware>();

=======
>>>>>>> origin/feature/dev-3
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
<<<<<<< HEAD
else
{
    app.UseHsts();
}

// Keep this only if using HTTPS in frontend
app.UseHttpsRedirection();
app.MapGet("/", () => "Localink API is running");

// IMPORTANT ORDER
app.UseRouting();               
app.UseCors("AllowAll"); 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();



app.MapGet("/health", () => Results.Ok("API is running"));


app.Run();
=======

// GLOBAL ERROR HANDLER
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseStaticFiles();

// CORS FIRST
app.UseCors("AllowFrontend");

// AUTH PIPELINE (IMPORTANT)
app.UseAuthentication();
app.UseAuthorization();

// ROUTES
app.MapGet("/", () => "Localink API is running");
app.MapControllers();
app.MapHub<NotificationHub>("/notifications");

app.Run();

// Required for WebApplicationFactory<Program> in integration tests
public partial class Program { }
>>>>>>> origin/feature/dev-3
