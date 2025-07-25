using Azure.Core;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Server_chat.apis.services;
using Server_chat.domain.Handler;
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
                 .RequireAuthorization()
                      .WithName("user api")
                      .WithSummary(summary)
                      .WithDescription("Lấy danh sách id đang hoạt động")
                      .WithTags("user");

            vApi.MapPost("/authentication/check", CheckAuthentication)
                .RequireAuthorization()
                  .WithName("authentication meets check")
                  .WithSummary(summary)
                  .WithDescription("Kiểm tra token định danh")
                  .WithTags("check");

            vApi.MapPost("/authentication/meet", postAuthenticationTokenAsync)
                   .WithName("authentication meets")
                   .WithSummary(summary)
                   .WithDescription("Đăng nhập hệ thống lấy token định danh")
                   .WithTags("authentication");


            return app;
        }

        public static async Task<Results<Ok<AuthenticationResponse>, ProblemHttpResult>> postAuthenticationTokenAsync([FromBody] AuthenticationRequest request, [AsParameters] AuthenticationServices services)
        {
            var data = await services.Mediator.Send(request);
            return TypedResults.Ok(data);
        }
        private static async Task<Results<Ok<AuthenticationResponse>, ProblemHttpResult>> CheckAuthentication(HttpContext httpContext, [AsParameters] AuthenticationServices services)
        {
            string token = await services.CurrenUserRepositories.GetTokenAsync();
            var data = await services.Mediator.Send(new TokenRequest(token));
            return TypedResults.Ok(data);
        }
        public static async Task<Results<Ok<IEnumerable<UserResponse>>, ProblemHttpResult>> GetItems([AsParameters] UserRequest userRequest, [AsParameters] UserServices userServices)
        {
            userRequest.CurrenID = await userServices.CurrenUserRepositories.GetCurrentUserIDAsync();
            var data = await userServices.Mediator.Send(userRequest);
            if (!data.Any())
            {
                return TypedResults.Problem(detail: "Không có dữ liệu", statusCode: 400);
            }
            return TypedResults.Ok(data);
        }
    }
}
