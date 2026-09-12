import { useContext } from 'react';
import AuthContext from './AuthContextObject';

// Hook to access auth user and methods anywhere in the app
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
