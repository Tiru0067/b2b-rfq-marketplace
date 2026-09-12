import api from './axios';

// Register a new user account
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Log in an existing user
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Fetch profile of the logged-in user
export const getMyProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
