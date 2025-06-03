import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage/sessionStorage/auth cookies as needed
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    sessionStorage.clear();

    // Optionally: call logout API if needed
    // await api.post('/logout')

    // Redirect user after logout
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-700">Logging you out...</h1>
        <p className="text-sm text-gray-500 mt-2">Please wait.</p>
      </div>
    </div>
  );
};

export default Logout;
