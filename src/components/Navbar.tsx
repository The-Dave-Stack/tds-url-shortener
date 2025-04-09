
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ui/theme-provider";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ModeToggle";
import { LogOut, Link as LinkIcon, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import NotificationsMenu from './NotificationsMenu';

const Navbar = () => {
  const { user, signOut, isAdmin, profile } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log("Navbar rendered, isAdmin:", isAdmin);
    console.log("User profile:", profile);
    setMounted(true);
  }, [isAdmin, profile]);

  if (!mounted) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-teal-deep" />
          <span className="text-xl font-bold text-teal-deep tracking-tight">
            {t('common.appName')}
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector />
          <ModeToggle />
          {user && <NotificationsMenu />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('dashboard.dashboard')}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      {t('admin.adminPanel')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link to="/auth">{t('auth.signIn')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
