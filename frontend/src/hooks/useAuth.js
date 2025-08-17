import { useContext } from 'react';
import { AuthContext } from '../context/AuthContex.jsx';

export default function useAuth() {
  return useContext(AuthContext);
}
