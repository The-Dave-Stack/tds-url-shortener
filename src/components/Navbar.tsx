
// Use your existing Navbar component, but add authentication UI

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white border-b px-4 py-2.5">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <Link to="/" className="text-xl font-bold text-gray-800">
          ShortLink Insight Hub
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button onClick={signOut} variant="outline">
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-brand-500 hover:bg-brand-600">
                Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
