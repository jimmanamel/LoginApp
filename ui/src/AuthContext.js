import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; // used for token refresh

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [expiryTime, setExpiryTime] = useState(
    sessionStorage.getItem("exp-time")
  );
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const navigate = useNavigate();

  const modalTimer = useRef(null);
  const logoutTimer = useRef(null);
  const countdownTimer = useRef(null);

  const login = (loginResponse) => {
    const expiryTime = loginResponse.exp;
    sessionStorage.setItem("exp-time", expiryTime);
    setExpiryTime(expiryTime);
    startTokenTimers(expiryTime);
  };

  const logout = () => {
    clearTimers();
    sessionStorage.removeItem("exp-time");
    setExpiryTime(null);
    setShowModal(false);
  };

  const clearTimers = () => {
    clearTimeout(modalTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdownTimer.current);
  };

  const startTokenTimers = (exp) => {
    clearTimers();

    try {
      const now = Date.now() / 1000;
      const secondsUntilExpiry = exp - now;

      if (secondsUntilExpiry <= 15) {
        // If expiry is too close, logout directly
        logout();
        return;
      }

      // Show modal 15 seconds before expiry
      modalTimer.current = setTimeout(() => {
        setShowModal(true);
        let timeLeft = 15;
        setCountdown(timeLeft);
        clearInterval(countdownTimer.current); // 🛠️ clear existing interval if any
        countdownTimer.current = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownTimer.current);
          }
        }, 1000);
      }, (secondsUntilExpiry - 15) * 1000);

      // Auto logout
      logoutTimer.current = setTimeout(() => {
        navigate("/");
        logout();
      }, secondsUntilExpiry * 1000);
    } catch (err) {
      console.error("Invalid token expiration time");
      logout();
    }
  };

  // Refresh token (simulate)
  const refreshToken = async () => {
    try {
      const response = await api.post("/refresh");
      const exp = response.data;
      login(exp); // resets timers
      setShowModal(false);
    } catch (err) {
      console.error("Token refresh failed");
      logout();
    }
  };

  useEffect(() => {
    if (expiryTime) {
      startTokenTimers(expiryTime);
    }
    return clearTimers;
  }, [expiryTime, startTokenTimers]);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        refreshToken,
        showModal,
        setShowModal,
        countdown,
        expiryTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
