using Microsoft.AspNetCore.Http.HttpResults;
using Server_chat.vm.user.Response;

namespace Server_chat.apis
{
    public static class UserApis
    {
        const string summary = "User items";
        public static IEndpointRouteBuilder MapUsersApis(this IEndpointRouteBuilder app)
        {
            var vApi = app.MapGroup("/api/user");

      
            vApi.MapGet("/items", GetItems)
                      .WithName("user api")
                      .WithSummary(summary)
                      .WithDescription("Lấy danh sách id đang hoạt động")
                      .WithTags("user");

            return app;
        }
        public static async Task<Ok<List<UserResponse>>> GetItems()
        {
            // Giả sử bạn có một danh sách người dùng đã đăng ký
            var users = new List<UserResponse>
            {
                new UserResponse
                {
                    ToUser = Guid.NewGuid(),
                    UserName = "user1",
                    isOnline = true
                },
                new UserResponse
                {
                    ToUser = Guid.NewGuid(),
                    UserName = "user2",
                    isOnline = false
                }
            };
            return TypedResults.Ok(users);
        }
    }
}
