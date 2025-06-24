using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Server_chat.apis.services;
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

            return app;
        }
        public static async Task<Results<Ok<IEnumerable<UserResponse>>, ProblemHttpResult>> GetItems([AsParameters]UserRequest userRequest, [AsParameters]UserServices userServices)
        {
            var data = await userServices.Mediator.Send(userRequest);
            if (!data.Any())
            {
                return TypedResults.Problem(detail: "Ship order failed to process.", statusCode: 500);
            }
            return TypedResults.Ok(data);
        }
    }
}
