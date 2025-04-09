
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface RequireAuthProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, adminOnly = false }) => {
  const { user, loading, profile, isAdmin } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if the user account is disabled
    if (user && profile && !profile.is_active) {
      toast.error(t("auth.accountDisabled"));
    }
    
    // Check if user is trying to access admin-only route
    if (adminOnly && user && profile && !isAdmin) {
      toast.error("You don't have permission to access this page");
    }
  }, [user, profile, isAdmin, adminOnly, t]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect non-admin users trying to access admin routes
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Redirect disabled users
  if (profile && !profile.is_active) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
