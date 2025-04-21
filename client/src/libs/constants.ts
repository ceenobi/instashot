export const authRegisterFields = [
  {
    label: "Fullname",
    type: "text",
    id: "fullname",
    name: "fullname",
    placeholder: "john doe",
    isRequired: true,
  },
  {
    label: "Username",
    type: "text",
    id: "username",
    name: "username",
    placeholder: "johndoe",
    isRequired: true,
  },
  {
    label: "Email",
    type: "email",
    id: "email",
    name: "email",
    placeholder: "johndoe@email.com",
    isRequired: true,
  },
  {
    label: "Password",
    type: "password",
    id: "password",
    name: "password",
    placeholder: "password",
    isRequired: true,
  },
];

export const sidebarLinks = [
  {
    id: 1,
    path: "/",
    name: "Home",
    Icon: "ri-home-line",
  },
  {
    id: 2,
    path: "/explore",
    name: "Explore",
    Icon: "ri-compass-line",
  },
];

export const postFields = [
  {
    label: "Caption",
    type: "text",
    id: "caption",
    name: "caption",
    placeholder: "Give it a headline",
    isRequired: true,
  },
  {
    label: "Description",
    type: "text",
    id: "description",
    name: "description",
    placeholder: "Write something...",
    isRequired: true,
  },
  {
    label: "Tags",
    type: "text",
    id: "tags",
    name: "tags",
    placeholder: "Tags...press enter to add one",
    isRequired: false,
  },
];

export const updateProfileFields = [
  {
    label: "Fullname",
    type: "text",
    id: "fullname",
    name: "fullname",
    placeholder: "john doe",
    isRequired: true,
  },
  {
    label: "Username",
    type: "text",
    id: "username",
    name: "username",
    placeholder: "johndoe",
    isRequired: true,
  },
  {
    label: "Email",
    type: "email",
    id: "email",
    name: "email",
    placeholder: "johndoe@email.com",
    isRequired: true,
  },
  {
    label: "Bio",
    type: "text",
    id: "bio",
    name: "bio",
    placeholder: "Write something about yourself...",
    isRequired: true,
  },
];

export const settingsLinks = [
  {
    id: 1,
    path: "/update-password",
    name: "Change password",
    Icon: "ri-lock-password-line",
  },
  {
    id: 3,
    path: "/account-privacy",
    name: "Account privacy",
    Icon: "ri-lock-line",
  },
  {
    id: 4,
    path: "/delete-account",
    name: "Delete account",
    Icon: "ri-delete-bin-line",
  },
];

export const passwordFields = [
  {
    label: "Current Password",
    type: "password",
    id: "currentPassword",
    name: "currentPassword",
    placeholder: "currentPassword",
    isRequired: true,
  },
  {
    label: "New Password",
    type: "password",
    id: "newPassword",
    name: "newPassword",
    placeholder: "newPassword",
    isRequired: true,
  },
  {
    label: "Confirm Password",
    type: "password",
    id: "confirmPassword",
    name: "confirmPassword",
    placeholder: "confirmPassword",
    isRequired: true,
  },
];
