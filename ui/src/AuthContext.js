import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; // for token refresh

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [expiryTime, setExpiryTime] = useState(() =>
    sessionStorage.getItem("exp-time")
  );
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const navigate = useNavigate();

  const modalTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const clearTimers = () => {
    clearTimeout(modalTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownTimerRef.current);
  };

  const startCountdown = () => {
    let timeLeft = 15;
    setCountdown(timeLeft);
    clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownTimerRef.current);
      }
    }, 1000);
  };

  const logout = useCallback(() => {
    clearTimers();
    sessionStorage.removeItem("exp-time");
    setExpiryTime(null);
    setShowModal(false);
    navigate("/");
  }, [navigate]);

  const startTokenTimers = useCallback(
    (exp) => {
      clearTimers();

      const now = Date.now() / 1000;
      const secondsUntilExpiry = exp - now;

      if (secondsUntilExpiry <= 15) {
        logout();
        return;
      }

      // Show modal 15s before token expires
      modalTimerRef.current = setTimeout(() => {
        setShowModal(true);
        startCountdown();
      }, (secondsUntilExpiry - 15) * 1000);

      // Auto logout on expiry
      logoutTimerRef.current = setTimeout(logout, secondsUntilExpiry * 1000);
    },
    [logout]
  );

  const login = useCallback(
    (loginResponse) => {
      const exp = loginResponse.exp;
      sessionStorage.setItem("exp-time", exp);
      setExpiryTime(exp);
      startTokenTimers(exp);
    },
    [startTokenTimers]
  );

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post("/refresh");
      const exp = response.data?.exp;
      if (!exp) throw new Error("No expiry in refresh response");
      login({ exp });
      setShowModal(false);
    } catch (err) {
      console.error("Token refresh failed", err);
      logout();
    }
  }, [login, logout]);

  useEffect(() => {
    if (expiryTime) {
      startTokenTimers(Number(expiryTime));
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
