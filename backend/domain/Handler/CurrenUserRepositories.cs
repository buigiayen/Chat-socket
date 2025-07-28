using AutoMapper;
using Server_chat.contract;
using Server_chat.domain.repositories;
using Server_chat.Domain.enities;
using Server_chat.extensions.notification;
using Server_chat.vm.user;
using System.IdentityModel.Tokens.Jwt;
namespace Server_chat.domain.Handler
{
    public class CurrenUserRepositories(IHttpContextAccessor httpContextAccessor, IUserRepositories userRepositories, IMapper mapper) : ICurrenUserRepositories
    {
        public async Task<Guid?> GetCurrentUserIDAsync()
        {
            httpContextAccessor.HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader);
            var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();

            if (string.IsNullOrEmpty(token))
                return null;

            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
                return null;

            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type == AuthenticationConst.SubID);

            if (userIdClaim == null)
                throw new UnauthorizedAccessException(ErrorNotification.ReturnLogin);
            var getCurrenUserMeet = await userRepositories.GetUserMeet(userIdClaim.Value);
            return getCurrenUserMeet?.UserID;
        }

        public async Task<UserResponse> GetCurrentUserSocketAsync()
        {
            httpContextAccessor.HttpContext.Request.Query.TryGetValue("Authorization", out var authHeader);
            var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();

            if (string.IsNullOrEmpty(token))
                return null;

            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
                return null;

            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type == AuthenticationConst.SubID);

            if (userIdClaim == null)
                return null;

            var socketCurren = await userRepositories.GetUserMeet(userIdClaim.Value);   
            var map = mapper.Map<UserResponse>(socketCurren); 
            if (socketCurren?.SocketID != null)
                map.SocketID = socketCurren?.SocketID;
            return map;
        }

        public async Task<string> GetTokenAsync()
        {
            httpContextAccessor.HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader);
            var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();
            return token;
        }
    }
}
