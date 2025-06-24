using Microsoft.AspNetCore.Http.HttpResults;
using Server_chat.apis.services;
using Server_chat.vm.authentication.meet;
using Server_chat.vm.user;

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

            vApi.MapPost("/authentication/meet", postAuthenticationTokenAsync)
                   .WithName("authentication meets")
                   .WithSummary(summary)
                   .WithDescription("Gửi tin nhắn trực tiếp")
                   .WithTags("authentication");

            return app;
        }

        public static async Task<Results<Ok<AuthenticationResponse>, ProblemHttpResult>> postAuthenticationTokenAsync([AsParameters] AuthenticationRequest request, [AsParameters] AuthenticationServices services)
        {
            var data = await services.Mediator.Send(request);
            return TypedResults.Ok(data);
        }

        public static async Task<Results<Ok<IEnumerable<UserResponse>>, ProblemHttpResult>> GetItems([AsParameters] UserRequest userRequest, [AsParameters] UserServices userServices)
        {
            var data = await userServices.Mediator.Send(userRequest);
            if (!data.Any())
            {
                return TypedResults.Problem(detail: "Không có dữ liệu", statusCode: 400);
            }
            return TypedResults.Ok(data);
        }
    }
}
