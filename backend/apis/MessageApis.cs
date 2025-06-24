


using Microsoft.AspNetCore.Http.HttpResults;
using Server_chat.vm.message.request;


namespace Server_chat.apis
{
    public static class MessageApis
    {

        const string summary = "Send Message APIs";

        public static IEndpointRouteBuilder MapMessageApis(this IEndpointRouteBuilder app)
        {
            var vApi = app.MapGroup("/api/message");

            vApi.MapPost("/items", PostItemsByIds)
                         .WithName("message api")
                         .WithSummary(summary)
                         .WithDescription("Gửi tin nhắn trực tiếp")
                         .WithTags("message");
            return app;
        }

        public static Task PostItemsByIds([AsParameters] SendMessage sendMessage)
        {

            return Task.CompletedTask;
        }

       
    }

}
