namespace UserMeet {
  interface UserLoginRequest {
    username: string;
    password: string;
    code: string;
  }

  interface UserResponse {
    user_id: string;
    auth_token: string;
    identification: string;
    name: string;
    ma_csdt: string;
    school_name: string;
    ma_dk: string;
    email: string;
    phone: string;
    meeting_code: string;
    image_url: string;
    gender: string;
    role: string;
    birthday: string;
    training_code: string;
    identification_address: string;
    name_course: string;
    code_course: string;
    date_start: string;
    img_school: string;
    block_subject_showtime: string;
    opening_day: string;
    closing_day: string;
    daily_study_time: string;
    allow_takePicture: string;
    join_date: null;
    last_login: string;
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
