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
