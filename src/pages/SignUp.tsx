import React from 'react';
import SignUpComponent from '../components/auth/SignUp';
import { Link } from 'react-router-dom';

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-600 py-4 px-6 flex justify-between items-center">
        <div className="text-white font-semibold text-xl">Leads Manager</div>
        <Link to="/login" className="text-white hover:underline text-sm">
          Already have an account? Sign in
        </Link>
      </div>
      <SignUpComponent />
    </div>
  );
};

export default SignUp;