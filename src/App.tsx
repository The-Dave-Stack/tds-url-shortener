
/**
 * Main Application Component
 * Sets up routing and global providers for the application
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import RedirectHandler from "./components/RedirectHandler";
import Health from "./pages/Health";
import AdminPanel from "./pages/AdminPanel";
import AnonymousStats from "./pages/AnonymousStats";

// Create a client for React Query
const queryClient = new QueryClient();

/**
 * App component - The root component of the application
 * Sets up routing and providers for global state/UI
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="url-shortener-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/dashboard/:id" 
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <RequireAuth adminOnly={true}>
                    <AdminPanel />
                  </RequireAuth>
                } 
              />
              {/* New route for anonymous stats */}
              <Route path="/anonymous-stats" element={<AnonymousStats />} />
              {/* Health check endpoint for Docker */}
              <Route path="/health" element={<Health />} />
              {/* Route for handling short URL redirects */}
              <Route path="/:shortCode" element={<RedirectHandler />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
