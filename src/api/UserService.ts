import {
  useUserRegistration,
  UserRegistrationData,
} from "../components/UserContext";

const API = process.env.EXPO_PUBLIC_APP_URL;

export const createNewAccount = async (
  UserRegistrationData: UserRegistrationData
) => {
  console.log(process.env.EXPO_PUBLIC_APP_URL);
  console.log(UserRegistrationData);

  const formData = new FormData();
  formData.append("firstName", UserRegistrationData.firstName);
  formData.append("lastName", UserRegistrationData.lastName);
  formData.append("countryCode", UserRegistrationData.countryCode);
  formData.append("contactNo", UserRegistrationData.contactNo);
  
  // Handle profileImage properly - check if it's a string URI or number (avatar ID)
  if (UserRegistrationData.profileImage) {
    if (typeof UserRegistrationData.profileImage === 'string' && UserRegistrationData.profileImage.startsWith('file://')) {
      // It's a file URI from image picker
      formData.append("profileImage", {
        uri: UserRegistrationData.profileImage,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);
    } else {
      // It's an avatar ID (number converted to string)
      formData.append("profileImage", UserRegistrationData.profileImage);
    }
  }

  // Ensure proper URL construction
  const apiUrl = API?.endsWith('/') ? `${API}UserController` : `${API}/UserController`;
  
  console.log('Making request to:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const json = await response.json();
      console.log('Success response:', json);
      return json;
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return {
        status: false,
        message: `Account creation failed! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};

export const sendOTP = async (countryCode: string, contactNo: string) => {
  const formData = new FormData();
  formData.append("countryCode", countryCode);
  formData.append("contactNo", contactNo);

  const apiUrl = API?.endsWith('/') ? `${API}UserController` : `${API}/UserController`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      const errorText = await response.text();
      return {
        status: false,
        message: `Failed to send OTP! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};

export const verifyOTP = async (userId: number, otp: string) => {
  const formData = new FormData();
  formData.append("userId", userId.toString());
  formData.append("otp", otp);

  const apiUrl = API?.endsWith('/') ? `${API}OTPVerificationController` : `${API}/OTPVerificationController`;
  
  console.log('UserService - verifyOTP userId:', userId, 'otp:', otp);
  console.log('UserService - verifyOTP URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      const errorText = await response.text();
      return {
        status: false,
        message: `OTP verification failed! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};

export const getFriendList = async (userId: number) => {
  const formData = new FormData();
  formData.append("userId", userId.toString());

  const apiUrl = API?.endsWith('/') ? `${API}FriendListController` : `${API}/FriendListController`;
  
  console.log('UserService - getFriendList userId:', userId);
  console.log('UserService - getFriendList URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      const errorText = await response.text();
      return {
        status: false,
        message: `Failed to load friend list! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};

export const searchUserByPhone = async (countryCode: string, contactNo: string, currentUserId: number) => {
  const params = new URLSearchParams();
  params.append("action", "searchUser");
  params.append("countryCode", countryCode);
  params.append("contactNo", contactNo);
  params.append("currentUserId", currentUserId.toString());

  const apiUrl = API?.endsWith('/') ? `${API}UserController?${params.toString()}` : `${API}/UserController?${params.toString()}`;
  
  console.log('UserService - searchUserByPhone countryCode:', countryCode, 'contactNo:', contactNo);
  console.log('UserService - searchUserByPhone URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      const errorText = await response.text();
      return {
        status: false,
        message: `Failed to search user! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};

export const addFriend = async (userId: number, friendId: number) => {
  const params = new URLSearchParams();
  params.append("action", "addFriend");
  params.append("userId", userId.toString());
  params.append("friendId", friendId.toString());

  const apiUrl = API?.endsWith('/') ? `${API}UserController?${params.toString()}` : `${API}/UserController?${params.toString()}`;
  
  console.log('UserService - addFriend userId:', userId, 'friendId:', friendId);
  console.log('UserService - addFriend URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      const errorText = await response.text();
      return {
        status: false,
        message: `Failed to add friend! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};

export const loginUser = async (countryCode: string, contactNo: string) => {
  // Use FormData but without profile image for login
  const formData = new FormData();
  formData.append("countryCode", countryCode);
  formData.append("contactNo", contactNo);
  formData.append("mode", "login");
  
  // Debug: Log FormData contents
  console.log('UserService - loginUser FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  // Ensure proper URL construction
  const apiUrl = API?.endsWith('/') ? `${API}UserController` : `${API}/UserController`;
  
  console.log('UserService - loginUser URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('UserService - loginUser response status:', response.status);
    
    if (response.ok) {
      const json = await response.json();
      console.log('UserService - loginUser response:', json);
      return json;
    } else {
      const errorText = await response.text();
      console.log('UserService - loginUser error response:', errorText);
      return {
        status: false,
        message: `Login failed! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('UserService - loginUser network error:', error);
    throw error;
  }
};

export const reverifyPhone = async (userId: number, otp: string) => {
  const params = new URLSearchParams();
  params.append("action", "reverifyPhone");
  params.append("userId", userId.toString());
  params.append("otp", otp);

  const apiUrl = API?.endsWith('/') ? `${API}UserController?${params.toString()}` : `${API}/UserController?${params.toString()}`;
  
  console.log('UserService - reverifyPhone userId:', userId, 'otp:', otp);
  console.log('UserService - reverifyPhone URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      const errorText = await response.text();
      return {
        status: false,
        message: `Failed to re-verify phone! Status: ${response.status}, Error: ${errorText}`
      };
    }
  } catch (error) {
    console.log('Network error:', error);
    throw error;
  }
};