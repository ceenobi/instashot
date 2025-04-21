import axiosInstance from "@/libs/axiosInstance";
import {
  ForgotPasswordFormData,
  LoginFormData,
  SignUpFormData,
  UpdatePasswordFormData,
  UpdateProfileFormData,
} from "@/types";

const accessToken = JSON.parse(
  localStorage.getItem("instaPixAccessToken") || "{}"
);

export const signUpUser = async (formData: SignUpFormData) => {
  return await axiosInstance.post("/auth/register", formData);
};

export const loginUser = async (formData: LoginFormData) => {
  return await axiosInstance.post("/auth/login", formData);
};

export const getAuthUser = async (token: string) => {
  return await axiosInstance.get("/auth/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const refreshToken = async () => {
  return await axiosInstance.post("/auth/refresh-token", {
    withCredentials: true,
  });
};

export const logoutUser = async () => {
  return await axiosInstance.post(
    "/auth/logout",
    {},
    {
      withCredentials: true,
    }
  );
};

export const forgotPassword = async (formData: ForgotPasswordFormData) => {
  return await axiosInstance.post("/auth/reset-password", formData);
};

export const resetPassword = async (
  userId: string,
  token: string,
  formData: { password: string }
) => {
  return await axiosInstance.patch(
    `/auth/update-password/${userId}/${token}`,
    formData
  );
};

export const resendVerificationEmail = async () => {
  return await axiosInstance.post(
    "/auth/resend-verification-email",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const verifyEmail = async (
  userId: string,
  verificationToken: string
) => {
  return await axiosInstance.patch(
    `/auth/verifyEmail/${userId}/${verificationToken}`
  );
};

export const followUser = async (followId: string) => {
  return await axiosInstance.patch(
    `/auth/follow/${followId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const getAUser = async (username: string) => {
  return await axiosInstance.get(`/auth/profile/${username}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updateProfilePicture = async (formData: {
  profilePicture: string | null;
}) => {
  return await axiosInstance.patch(`/auth/updateProfilePicture`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updateProfile = async (formData: UpdateProfileFormData) => {
  return await axiosInstance.patch(`/auth/updateProfile`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getUserConnections = async (username: string, type: string) => {
  return await axiosInstance.get(`/auth/connections/${username}?type=${type}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const search = async (query: string) => {
  return await axiosInstance.get(`/auth/search?query=${query}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getSuggestions = async () => {
  return await axiosInstance.get(`/auth/suggestions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updatePassword = async (formData: UpdatePasswordFormData) => {
  return await axiosInstance.patch("/auth/update-password", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updateUserPrivacy = async (formData: { isPublic: boolean }) => {
  return await axiosInstance.patch("/auth/update-privacy", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const deleteAccount = async () => {
  return await axiosInstance.delete("/auth/delete-account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

