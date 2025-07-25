namespace UserMeet {
  interface UserLoginRequest {
    username: string;
    password: string;
    code: string;
  }

  interface UserResponse {
    status: string;
    message: string;
    userInfo: UserInfo;
    code: number;
    token: string;
  }

  interface UserInfo {
    sub: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
    data: Data;
    userID: string;
  }

  interface Data {
    user_id: string;
    id: string;
    identification: string;
    name: string;
  }
}
namespace UserChat {
  interface UserCenter {
    userID: string;
    name: string;
    isOnline: boolean;
    centerID: string;
    socketID: string;
  }
}
