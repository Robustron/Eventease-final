import * as React from 'react';
import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

// Firebase Imports
import { auth, db } from '@/firebaseConfig'; 
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from 'firebase/auth'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLoginMode) {
      // --- Login Logic ---
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // No role check needed here for customer login
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate("/customer/dashboard"); // Redirect to customer dashboard
      } catch (error: any) {
        console.error("Customer Login Error:", error);
        let errorMessage = "Invalid email or password.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Invalid email or password.";
        } else if (error.code === 'auth/invalid-credential') {
             errorMessage = "Invalid email or password.";
        }
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- Sign Up Logic ---
      if (password !== confirmPassword) {
        toast({
          title: "Sign Up Failed",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        setIsLoading(false);
        return; 
      }
      
      try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Create user document in Firestore with customer role
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          role: 'customer', // Set role to customer
          createdAt: serverTimestamp(), 
        });
        
        toast({
          title: "Sign Up Successful",
          description: "Your account has been created. Welcome!",
        });
        navigate("/customer/dashboard"); // Redirect to customer dashboard
        
      } catch (error: any) { 
        console.error("Customer Sign Up Error:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "This email address is already registered. Try logging in.";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "Password should be at least 6 characters long.";
        }
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
           setIsLoading(false);
      }
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
           <div className="text-center">
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  {isLoginMode ? "Customer Login" : "Create Customer Account"}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                 Or{' '}
                 <button 
                    type="button" 
                    onClick={() => setIsLoginMode(!isLoginMode)} 
                    className="font-medium text-eventease-600 hover:text-eventease-500"
                 >
                    {isLoginMode ? "create an account" : "login to your account"}
                 </button>
               </p>
           </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
              <div className="rounded-md shadow-sm -space-y-px">
                 <div>
                     <Label htmlFor="email-address">Email address</Label>
                     <Input
                         id="email-address"
                         name="email"
                         type="email"
                         autoComplete="email"
                         required
                         className="input-field w-full mt-1"
                         placeholder="Email address"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                     />
                 </div>
                 <div className="pt-4">
                     <Label htmlFor="password">Password</Label>
                     <Input
                         id="password"
                         name="password"
                         type="password"
                         autoComplete={isLoginMode ? "current-password" : "new-password"}
                         required
                         className="input-field w-full mt-1"
                         placeholder="Password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                     />
                 </div>
                 {!isLoginMode && (
                     <div className="pt-4">
                         <Label htmlFor="confirm-password">Confirm Password</Label>
                         <Input
                             id="confirm-password"
                             name="confirmPassword"
                             type="password"
                             autoComplete="new-password"
                             required={!isLoginMode}
                             className="input-field w-full mt-1"
                             placeholder="Confirm Password"
                             value={confirmPassword}
                             onChange={(e) => setConfirmPassword(e.target.value)}
                         />
                     </div>
                 )}
              </div>

              {isLoginMode && (
                  <div className="flex items-center justify-end">
                       <div className="text-sm">
                         <Link to="#" className="font-medium text-eventease-600 hover:text-eventease-500">
                             Forgot your password?
                         </Link>
                       </div>
                  </div>
              )}

              <div>
                 <Button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-eventease-600 hover:bg-eventease-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eventease-500" disabled={isLoading}>
                     {isLoading ? (
                         <Loader2 className="h-5 w-5 animate-spin" />
                     ) : (
                         isLoginMode ? 'Sign in' : 'Create Account'
                     )}
                 </Button>
              </div>
          </form>
       </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerLogin; 