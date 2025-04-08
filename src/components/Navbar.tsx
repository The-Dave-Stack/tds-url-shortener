
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, Link as LinkIcon } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-brand-500" />
          <span className="font-bold text-xl text-gray-900">ShortLink</span>
        </Link>
        
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <Link to="/" className="text-gray-600 hover:text-brand-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-gray-600 hover:text-brand-600 transition-colors">
                Mis URLs
              </Link>
            </li>
            <li>
              <Button asChild variant="default" className="bg-brand-500 hover:bg-brand-600">
                <Link to="/dashboard" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Analítica</span>
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
