


using Microsoft.AspNetCore.Http.HttpResults;
using Server_chat.apis.services;
using Server_chat.vm.message;
using Server_chat.vm.user;


namespace Server_chat.apis
{
    public static class MessageApis
    {

        const string summary = "Send Message APIs";

        public static IEndpointRouteBuilder MapMessageApis(this IEndpointRouteBuilder app)
        {
            var vApi = app.MapGroup("/api/message");

            vApi.MapGet("/items", GetItemsByIds)
                         .WithName("message api")
                         .WithSummary(summary)
                         .WithDescription("Gửi tin nhắn trực tiếp")
                         .WithTags("message");
         
            return app;
        }

        public static async Task<Results<Ok<IEnumerable<MessageResponse>>, ProblemHttpResult>> GetItemsByIds([AsParameters] MessageRequest sendMessage, [AsParameters] MessageServices services)
        {
            var data = await services.Mediator.Send(sendMessage);
         
            return TypedResults.Ok(data);
        }


    }

}
