using Scalar.AspNetCore;
using Server_chat.apis;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddOpenApi();
builder.Services.AddCors();
var app = builder.Build();
app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true).AllowCredentials());
app.MapHub<ChatHub>("/chathub");

app.MapOpenApi();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/openapi/v1.json", "v1 open api");
});
app.MapScalarApiReference();
app.MapMessageApis();
app.MapUsersApis();
app.Run();
