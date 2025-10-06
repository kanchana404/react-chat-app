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
  formData.append("profileImage", {
    uri: UserRegistrationData.profileImage,
    name: "profile.jpg",
    type: "image/jpeg",
  } as any);

  const response = await fetch(API + "/UserController", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const json = await response.json();
    console.log(json);
    return json;
  } else {
    console.log("Account creation failed!");
    return "Account creation failed!";
  }
};
