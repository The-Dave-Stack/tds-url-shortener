
/**
 * Layout component
 * Provides consistent page structure with header, main content, and footer
 */

import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-fog-gray dark:bg-night-blue text-petrol-blue dark:text-fog-gray">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-petrol-blue border-t border-soft-gray dark:border-dark-blue-gray py-6">
        <div className="container mx-auto px-4 text-center text-sm text-petrol-blue dark:text-fog-gray">
          <p>© {new Date().getFullYear()} URL Shortener. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
