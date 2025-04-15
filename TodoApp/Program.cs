using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using System.Text;
using TodoApp.Data;
using TodoApp.Model;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// DB Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Seed the database
// Seed the database
//app.Seed();

if (app.Environment.IsDevelopment())
{
    // ✅ Swagger middleware
    app.UseSwagger();
    app.UseSwaggerUI();

    // ✅ Optional: open Swagger in browser
    Task.Run(() => OpenBrowser("https://localhost:5217/swagger"));
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// Helper to open Swagger automatically
void OpenBrowser(string url)
{
    try
    {
        var psi = new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        };
        Process.Start(psi);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to open browser: {ex.Message}");
    }
}

void SeedDatabase(IApplicationBuilder app)
{
    using var scope = app.ApplicationServices.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    try
    {
        if (!context.Users.Any())
        {
            Console.WriteLine("Seeding database...");
            var random = new Random();
            var todoItems = new List<TodoItem>();

            for (int i = 1; i <= 10000; i++)
            {
                var user = new User
                {
                    UserName = $"user{i}",
                    Email = $"user{i}@example.com",
                    EmailConfirmed = true
                };
                Console.WriteLine("Creating user: " + user.UserName);
                // Create user
                var result = userManager.CreateAsync(user, "Password@123").Result;
                if (result.Succeeded)
                {
                    // Create 6 todos for each user
                    for (int j = 1; j <= 6; j++)
                    {
                        todoItems.Add(new TodoItem
                        {
                            Title = $"Task {j} for User {i}",
                            Description = $"Description for Task {j} of User {i}",
                            IsCompleted = random.Next(0, 2) == 1,
                            UserId = user.Id
                        });
                    }
                }
                else
                {
                    Console.WriteLine($"Failed to create user {i}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }

            // Bulk insert todos
            context.TodoItems.AddRange(todoItems);
            context.SaveChanges();
            Console.WriteLine("Database seeding completed.");
        }
        else
        {
            Console.WriteLine("Database already seeded.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during seeding: {ex.Message}");
    }
}


