import { useRoutes } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from './Dashboard';
import Login from './Login';
import SessionTimeoutModal from './sessionTimeOutModal';

function App() {
  const routes = useRoutes([
    { path: '/', element: <Login /> },
    {
      path: '/dashboard',
      element: (
          <Dashboard />
      ),
    },
  ]);

  return (
    <>
      {routes}
      <SessionTimeoutModal /> 
    </>
  );
}

export default App;
