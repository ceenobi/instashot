export interface CustomError {
  message: string;
}

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  fullname: string;
}

export interface UpdateProfileFormData {
  username: string;
  email: string;
  fullname: string;
  bio: string;
  isPublic: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}
export interface ForgotPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProps {
  isError: unknown;
  data: unknown;
  isAuthenticated: boolean;
}

export interface User {
  [x: string]: unknown;
  id: string;
  username: string;
  email: string;
  fullname: string;
  profilePicture?: string;
  bio?: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  isPublic: boolean;
  followers?: string[];
  following?: string[];
  createdAt: string;
  updatedAt: string;
  isAuthenticated?: boolean;
}

export interface Post {
  id: string;
  caption: string;
  description: string;
  media: string[];
  tags?: string[];
  isPublic: boolean;
  likes?: {
    id: string;
    username: string;
    profilePicture: string;
  }[];
  savedBy?: {
    id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    profilePicture: string;
  };
  userId?: string;
}

export interface Comment {
  id: string;
  content: string;
  likes?: {
    id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    profilePicture: string;
  };
}

export interface Story {
  id: string;
  caption: string;
  media: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    profilePicture: string;
    id: string;
  };
  userId?: string;
  expiresAt: string;
  storyLikes: { id: string; username: string; profilePicture: string }[] | null;
  views: number;
  viewers: { id: string; username: string; profilePicture: string }[] | null;
}
