import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white font-poppins">404</h1>
        <p className="text-xl text-white/75 mb-4 font-poppins">
          Oops! Page not found
        </p>
        <a
          href="/"
          className="text-blue-400 hover:text-blue-300 underline font-poppins"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
