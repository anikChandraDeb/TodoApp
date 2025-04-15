using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Model;

namespace TodoApp.Data
{
    public static class DataSeeder
    {
        public static void Seed(this IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            // Apply pending migrations
            //context.Database.Migrate();

            if (true)
            {
                Console.WriteLine("Seeding database...");
                var random = new Random();

                // Create 10 users
                for (int i = 1; i <= 10; i++)
                {
                    var user = new User
                    {
                        UserName = $"user{i}",
                        Email = $"user{i}@example.com",
                        EmailConfirmed = true
                    };

                    // Create user
                    var result = userManager.CreateAsync(user, "Password@123").Result;
                    if (result.Succeeded)
                    {
                        Console.WriteLine($"Created user: {user.UserName}");

                        // Batch insert todos for the user
                        for (int batch = 0; batch < 10; batch++) // 10 batches of 1,000 = 10,000 todos
                        {
                            var todos = new List<TodoItem>();
                            for (int j = 1; j <= 1000; j++)
                            {
                                var todoNumber = batch * 1000 + j;
                                todos.Add(new TodoItem
                                {
                                    Title = $"Task {todoNumber} for {user.UserName}",
                                    Description = $"Description for Task {todoNumber} of {user.UserName}",
                                    IsCompleted = random.Next(0, 2) == 1,
                                    
                                    UserId = user.Id
                                });
                            }

                            context.TodoItems.AddRange(todos);
                            context.SaveChanges();
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Failed to create user {i}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }

                Console.WriteLine("Database seeding completed.");
            }
            else
            {
                Console.WriteLine("Database already seeded.");
            }
        }
    }
}
