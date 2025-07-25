


using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using Server_chat.apis.services;
using Server_chat.hub;
using Server_chat.vm.message;
using Server_chat.vm.user;

namespace Server_chat.apis
{
    public static class MessageApis
    {

        const string summary = "Send Message APIs";

        public static IEndpointRouteBuilder MapMessageApis(this IEndpointRouteBuilder app)
        {
            var vApi = app.MapGroup("/api/message").RequireAuthorization();

            vApi.MapGet("/items", GetItemsByIds)
                         .WithName("history message")
                         .WithSummary(summary)
                         .WithDescription("Tìm kiếm tin nhắn")
                         .WithTags("message");

           

            return app;
        }

        public static async Task<Results<Ok<IEnumerable<SearchMessageResponse>>, ProblemHttpResult>> GetItemsByIds([AsParameters] SearchMessageRequest sendMessage, [AsParameters] MessageServices services)
        {
            var data = await services.Mediator.Send(sendMessage);
            return TypedResults.Ok(data);
        }


    }

}
