import { useAuth } from "./AuthContext";
import { useState, useEffect } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setData({ message: 'Unauthorized' }));
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/logout'); // clears cookie on server
      logout(); // clears context, timers, etc.
      navigate('/'); // ✅ redirect to login
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div>
        <h2>Dashboard</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <p>Logged in successfully</p>
        <button type="submit" onClick={handleLogout}>
            logout
        </button>
    </div>
  );
};

export default Dashboard;
