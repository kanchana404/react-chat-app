export const validateFirstName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return "First name is required";
  }
  return null;
};

export const validateLastName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return "Last name is required";
  }
  return null;
};

export const validateCountryCode = (countryCode: string): string | null => {
  const regex = /^\+[1-9]\d{0,3}$/;
  if (!countryCode || countryCode.trim().length === 0) {
    return "Country code is empty";
  }
  if (!regex.test(countryCode)) {
    return "Invalid country code";
  }
  return null;
};

export const validatePhoneNo = (phoneNo: string): string | null => {
  const regex = /^[1-9][0-9]{6,14}$/; // E.164-ish
  if (!phoneNo || phoneNo.trim().length === 0) {
    return "Contact number is required";
  }
  if (!regex.test(phoneNo)) {
    return "Invalid contact number";
  }
  return null;
};

export const validateProfileImage = (
  image: {
    uri: string;
    type?: string;
    fileSize?: number;
  } | null
): string | null => {
  if (!image) {
    return "Profile image is required";
  }
  if (!image.uri) {
    return "Profile image URI is required";
  }
  if (
    !image.type ||
    !["image/jpeg", "image/png", "image/jpg"].includes(image.type)
  ) {
    return "Invalid profile image type";
  }
  if (image.fileSize !== undefined && image.fileSize > 5 * 1024 * 1024) {
    return "Profile image must be less than 5MB";
  }
  return null;
};
