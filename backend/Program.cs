using Microsoft.Data.SqlClient;
using Scalar.AspNetCore;
using Server_chat.apis;
using Server_chat.domain.Handler;
using Server_chat.domain.repositories;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors();
builder.Services.AddMediatR(f =>
{
    f.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());
});
builder.Services.AddAutoMapper(typeof(Server_chat.mapper.map));
builder.Services.AddTransient<IDbConnection>((sp) => new SqlConnection(builder.Configuration.GetConnectionString("sqlconnection")));
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddScoped<IUserRepositories, UserRepositories>();
builder.Services.AddScoped<IMessageRepositories, MessageRepositories>();
builder.Services.AddTransient<ICurrenUserRepositories, CurrenUserRepositories>();
builder.Services.AddHttpClient();
builder.Services.AddSignalR();


var app = builder.Build();



if (app.Environment.IsDevelopment())
{
    app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true).AllowCredentials());
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1 open api");
    });
    app.MapScalarApiReference();
}

// Buộc môi trường https trên server product
if (app.Environment.IsProduction())
{
    app.UseCors(x => x.AllowAnyMethod().AllowAnyHeader().SetIsOriginAllowed(origin => true).AllowCredentials());
    app.UseHttpsRedirection();
}

app.MapMessageApis();
app.MapUsersApis();

app.MapHub<ChatHub>("/chathub");


app.Run();
