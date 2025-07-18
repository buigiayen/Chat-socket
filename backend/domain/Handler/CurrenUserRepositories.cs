using Server_chat.contract;
using Server_chat.domain.repositories;
using Server_chat.extensions.notification;
using System.IdentityModel.Tokens.Jwt;
namespace Server_chat.domain.Handler
{
    public class CurrenUserRepositories(IHttpContextAccessor httpContextAccessor, IUserRepositories userRepositories) : ICurrenUserRepositories
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
            return getCurrenUserMeet.UserID;
        }

        public async Task<(Guid?, string)> GetCurrentUserSocketAsync()
        {
            httpContextAccessor.HttpContext.Request.Query.TryGetValue("Authorization", out var authHeader);
            var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();

            if (string.IsNullOrEmpty(token))
                return (null, string.Empty);

            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
                return (null, string.Empty);

            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type == AuthenticationConst.SubID);

            if (userIdClaim == null)
                return (null, string.Empty);

            var socketCurren = await userRepositories.GetUserMeet(userIdClaim.Value);
            return (socketCurren.UserID, socketCurren.SocketID);
        }
    }
}
