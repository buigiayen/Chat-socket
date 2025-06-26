using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Server_chat.apis;
using Server_chat.domain.Handler;
using Server_chat.domain.repositories;
using Server_chat.hub;
using System.Data;
using System.Text;

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

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration.GetSection("secured:Issuer").Value,
        ValidAudience = builder.Configuration.GetSection("secured:Audience").Value,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("secured:signature").Value))
    };
});

var app = builder.Build();



if (app.Environment.IsStaging() || app.Environment.IsStaging())
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
app.UseAuthentication();
app.UseAuthorization();


app.MapMessageApis();
app.MapUsersApis();

app.MapHub<ChatHub>("/chathub");


app.Run();
