import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function useGoback() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(() => {
    const canGoBack = window.history.length > 1;
    if (canGoBack) {
      navigate(-1);
    } else {
      if (location.pathname.startsWith("/connection")) {
        navigate("/connection");
      } else {
        navigate("/instance");
      }
    }
  }, [navigate, location]);

  return goBack;
}
