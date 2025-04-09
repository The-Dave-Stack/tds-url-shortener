
// Navbar.tsx - Main navigation bar component
// Provides navigation links and authentication UI

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Moon, Sun, Link as LinkIcon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

/**
 * Main navigation bar component
 * Displays logo, navigation links and authentication options
 */
const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-petrol-blue border-b border-soft-gray dark:border-dark-blue-gray px-4 py-2.5 shadow-sm">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <Link to="/" className="text-xl font-bold text-petrol-blue dark:text-white flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-teal-deep" />
          <span>URL Shortener</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="text-petrol-blue dark:text-fog-gray"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-petrol-blue dark:text-fog-gray hover:text-teal-deep dark:hover:text-mint-green">
                  Dashboard
                </Button>
              </Link>
              <Button 
                onClick={signOut} 
                variant="outline"
                className="border-teal-deep text-teal-deep hover:bg-mint-green/10 hover:text-mint-green hover:border-mint-green"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-teal-deep hover:bg-mint-green text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
