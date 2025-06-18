import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wrench, LogIn } from 'lucide-react';
import Button from '../common/Button';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Wrench className="h-12 w-12 text-red-700" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vicky Auto Service
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Log in to access your workshop management dashboard
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter username here"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Your Password here"
                />
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                fullWidth
                variant="primary"
                size="lg"
                isLoading={isLoading}
                icon={LogIn}
              >
                Sign in
              </Button>
            </div>
          </form>
          
          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-red-50 px-3 py-2 rounded-md border border-red-200">
                <p className="text-xs font-medium text-red-900">Admin</p>
                <p className="text-xs text-red-700">Username: admin</p>
                <p className="text-xs text-red-700">Password: admin123</p>
              </div>
              
              <div className="bg-red-50 px-3 py-2 rounded-md border border-red-200">
                <p className="text-xs font-medium text-red-900">Staff</p>
                <p className="text-xs text-red-700">Username: staff1</p>
                <p className="text-xs text-red-700">Password: staff123</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;