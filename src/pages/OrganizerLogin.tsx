
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";

const OrganizerLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      try {
        await login(email, password);
        toast({
          title: "Login Successful",
          description: "Welcome back to EventEase!",
        });
        navigate("/organizer/dashboard");
      } catch (error) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Registration would normally be handled here
      // For now, we'll show a toast message
      toast({
        title: "Registration Not Available",
        description: "This is a demo. Please use the login option.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Navbar />
      
      <motion.div
        className="min-h-screen pt-24 pb-16 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {isLoginMode ? "Organizer Login" : "Register as Organizer"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isLoginMode
                  ? "Access your dashboard to manage event inquiries"
                  : "Create an account to offer your services on EventEase"}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              {/* Tab selector */}
              <div className="flex mb-6 border-b">
                <button
                  className={`flex-1 pb-2 text-center ${
                    isLoginMode
                      ? "border-b-2 border-eventease-600 text-eventease-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => setIsLoginMode(true)}
                >
                  Login
                </button>
                <button
                  className={`flex-1 pb-2 text-center ${
                    !isLoginMode
                      ? "border-b-2 border-eventease-600 text-eventease-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => setIsLoginMode(false)}
                >
                  Register
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Your email address"
                    className="input-field w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For demo, use "organizer@eventease.com"
                  </p>
                </div>
                
                {!isLoginMode && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Your phone number"
                      className="input-field w-full"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLoginMode}
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Your password"
                    className="input-field w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For demo, use "password"
                  </p>
                </div>
                
                {!isLoginMode && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      className="input-field w-full"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLoginMode}
                    />
                  </div>
                )}
                
                {isLoginMode && (
                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-eventease-600 hover:text-eventease-700">
                      Forgot password?
                    </a>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Please wait..."
                    : isLoginMode
                    ? "Login"
                    : "Create Account"}
                </button>
                
                <div className="mt-6 text-center text-sm">
                  <p className="text-gray-600">
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      className="text-eventease-600 hover:text-eventease-700 font-medium"
                      onClick={() => setIsLoginMode(!isLoginMode)}
                    >
                      {isLoginMode ? "Register here" : "Login here"}
                    </button>
                  </p>
                </div>
                
                {/* OAuth Providers Section - Just UI, not functional */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div>
                      <a
                        href="#"
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                        </svg>
                      </a>
                    </div>
                    
                    <div>
                      <a
                        href="#"
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-6">
                  <p>
                    Note: This is a demo application. Firebase Authentication would be integrated in a production environment.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </>
  );
};

export default OrganizerLogin;
