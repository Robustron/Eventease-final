import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, UserCog, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, authLoading, logout } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      if (currentUser) {
        setRoleLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data()?.role || null);
          } else {
            setUserRole(null);
            console.warn("User document not found for UID:", currentUser.uid);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          setUserRole(null);
        } finally {
          setRoleLoading(false);
        }
      } else {
        setUserRole(null);
        setRoleLoading(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [currentUser, authLoading]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
      setUserRole(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = authLoading || (currentUser && roleLoading);
  if (isLoading) {
    return (
      <nav className="bg-white shadow-md fixed w-full z-50 top-0 left-0 h-16 flex items-center">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-eventease-600">
            EventEase
          </Link>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      </nav>
    );
  }

  const showOrganizerLinks = currentUser && userRole === 'organizer';
  const showCustomerLinks = currentUser && userRole === 'customer';

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0 left-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-eventease-600">
              EventEase
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="nav-link">Home</Link>
            
            {showCustomerLinks && (
              <Link to="/customer/dashboard" className="nav-link flex items-center">
                <LayoutDashboard className="mr-1 h-4 w-4" /> My Dashboard
              </Link>
            )}
            
            {showOrganizerLinks && (
              <Link to="/organizer/dashboard" className="nav-link flex items-center">
                <LayoutDashboard className="mr-1 h-4 w-4" /> Organizer Dashboard
              </Link>
            )}
            
            {currentUser ? (
              <Button onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/customer/login">
                  <Button>
                    <User className="mr-1 h-4 w-4" /> Customer Login
                  </Button>
                </Link>
                <Link to="/organizer/login">
                  <Button>
                    <UserCog className="mr-1 h-4 w-4" /> Organizer Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-500 hover:text-eventease-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link onClick={() => setIsOpen(false)} to="/" className="mobile-nav-link">Home</Link>
          
          {showCustomerLinks && (
            <Link onClick={() => setIsOpen(false)} to="/customer/dashboard" className="mobile-nav-link flex items-center">
              <LayoutDashboard className="mr-2 h-5 w-5" /> My Dashboard
            </Link>
          )}
          
          {showOrganizerLinks && (
            <Link onClick={() => setIsOpen(false)} to="/organizer/dashboard" className="mobile-nav-link flex items-center">
              <LayoutDashboard className="mr-2 h-5 w-5" /> Organizer Dashboard
            </Link>
          )}
          
          <div className="border-t border-gray-100 pt-4 mt-3">
            {currentUser ? (
              <Button onClick={handleLogout} className="w-full justify-start mobile-nav-link">
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            ) : (
              <div className="space-y-2">
                <Link onClick={() => setIsOpen(false)} to="/customer/login">
                  <Button className="w-full justify-start mobile-nav-link">
                    <User className="mr-2 h-5 w-5" /> Customer Login/Sign Up
                  </Button>
                </Link>
                <Link onClick={() => setIsOpen(false)} to="/organizer/login">
                  <Button className="w-full justify-start mobile-nav-link">
                    <UserCog className="mr-2 h-5 w-5" /> Organizer Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
