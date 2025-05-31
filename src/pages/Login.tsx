import React from "react";
import LoginComponent from "../components/auth/Login";
// import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <div className="bg-blue-600 py-4 px-6 flex justify-between items-center">
        <div className="text-white font-semibold text-xl">Leads Manager</div>
        <Link to="/signup" className="text-white hover:underline text-sm">
          Don't have an account? Sign up
        </Link>
      </div> */}
      <LoginComponent />
    </div>
  );
};

export default Login;
