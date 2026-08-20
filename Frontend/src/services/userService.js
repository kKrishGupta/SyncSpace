import apiClient from "./apiClient";

export const updateProfile = async (profileData) => {
  return await apiClient("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
};

export const updatePassword = async (passwordData) => {
  return await apiClient("/auth/password", {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
};
