
import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-eventease-600 font-bold text-2xl">EventEase</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-eventease-600 transition-colors">
            Home
          </Link>
          <Link to="/inquire" className="text-gray-700 hover:text-eventease-600 transition-colors">
            Submit Inquiry
          </Link>
          {isAuthenticated ? (
            <>
              <Link 
                to="/organizer/dashboard" 
                className="text-gray-700 hover:text-eventease-600 transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="text-gray-700 hover:text-eventease-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/organizer/login" 
              className="bg-eventease-600 text-white px-4 py-2 rounded-md hover:bg-eventease-700 transition-colors"
            >
              Organizer Login
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-eventease-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/inquire" 
                className="text-gray-700 hover:text-eventease-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Inquiry
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/organizer/dashboard" 
                    className="text-gray-700 hover:text-eventease-600 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-eventease-600 transition-colors text-left py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/organizer/login" 
                  className="bg-eventease-600 text-white px-4 py-2 rounded-md hover:bg-eventease-700 transition-colors inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Organizer Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
