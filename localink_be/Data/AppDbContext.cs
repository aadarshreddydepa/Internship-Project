using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Subcategory> Subcategories { get; set; }

    public DbSet<Business> Businesses { get; set; }
    public DbSet<BusinessContact> BusinessContacts { get; set; }
    public DbSet<BusinessPhoto> BusinessPhotos { get; set; }

    public DbSet<BusinessHour> BusinessHours { get; set; }
    public DbSet<BusinessHourSlot> BusinessHourSlots { get; set; }

    public DbSet<Address> Addresses { get; set; }
    public DbSet<AdminDashboard> AdminDashboards { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureCategory(modelBuilder);
        ConfigureSubcategory(modelBuilder);
        ConfigureBusiness(modelBuilder);
        ConfigureBusinessContact(modelBuilder);
        ConfigureBusinessPhoto(modelBuilder);
        ConfigureBusinessHours(modelBuilder);
        ConfigureUser(modelBuilder);
    }


    private void ConfigureCategory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("category");

            entity.Property(c => c.CategoryId).HasColumnName("category_id");
            entity.Property(c => c.CategoryName).HasColumnName("category_name");
            entity.Property(c => c.IconUrl).HasColumnName("icon_url");
        });
    }


    private void ConfigureSubcategory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subcategory>(entity =>
        {
            entity.ToTable("subcategory");

            entity.Property(s => s.SubcategoryId).HasColumnName("subcategory_id");
            entity.Property(s => s.SubcategoryName).HasColumnName("subcategory_name");
            entity.Property(s => s.CategoryId).HasColumnName("category_id");
            entity.Property(s => s.IconUrl).HasColumnName("icon_url");
        });
    }


    private void ConfigureBusiness(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Business>(entity =>
        {
            entity.ToTable("business");

            entity.Property(b => b.BusinessId).HasColumnName("business_id");
            entity.Property(b => b.BusinessName).HasColumnName("business_name");
            entity.Property(b => b.Description).HasColumnName("description");
            entity.Property(b => b.CategoryId).HasColumnName("category_id");
            entity.Property(b => b.SubcategoryId).HasColumnName("subcategory_id");
            entity.Property(b => b.UserId).HasColumnName("user_id");
        });
    }


    private void ConfigureBusinessContact(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BusinessContact>(entity =>
        {
            entity.ToTable("business_contact");

            entity.Property(c => c.ContactId).HasColumnName("contact_id");
            entity.Property(c => c.BusinessId).HasColumnName("business_id");
            entity.Property(c => c.PhoneNumber).HasColumnName("phone_number");
            entity.Property(c => c.Email).HasColumnName("email");
            entity.Property(c => c.City).HasColumnName("city");
            entity.Property(c => c.State).HasColumnName("state");
        });
    }

    private void ConfigureBusinessPhoto(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BusinessPhoto>(entity =>
        {
            entity.ToTable("business_photos");

            entity.Property(p => p.PhotoId).HasColumnName("photo_id");
            entity.Property(p => p.BusinessId).HasColumnName("business_id");
            entity.Property(p => p.ImageUrl).HasColumnName("image_url");
            entity.Property(p => p.IsPrimary).HasColumnName("is_primary");
        });
    }


    private void ConfigureBusinessHours(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BusinessHour>()
            .HasMany(b => b.Slots)
            .WithOne()
            .HasForeignKey(s => s.BusinessHourId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(u => u.UserId);

            entity.Property(u => u.UserId).HasColumnName("user_id");
            entity.Property(u => u.AccountType).HasColumnName("account_type");
            entity.Property(u => u.FullName).HasColumnName("full_name");
            entity.Property(u => u.Email).HasColumnName("email");
            entity.Property(u => u.PhoneNumber).HasColumnName("phone_number");
            entity.Property(u => u.PasswordHash).HasColumnName("password_hash");
            entity.Property(u => u.CountryCode).HasColumnName("country_code");

            entity.Property(u => u.PasswordResetOtp).HasColumnName("password_reset_otp");
            entity.Property(u => u.OtpExpiry).HasColumnName("otp_expiry");
            entity.Property(u => u.OtpAttempts).HasColumnName("otp_attempts");

            entity.HasIndex(u => u.PhoneNumber).IsUnique();
        });
    }
}