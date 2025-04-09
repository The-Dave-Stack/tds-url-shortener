
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersManagement from "@/components/admin/UsersManagement";
import AppSettings from "@/components/admin/AppSettings";
import { Users, Settings } from "lucide-react";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");
  const { isAdmin, loading } = useAuth();
  const { t } = useTranslation();

  // Show loading while checking auth status
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  // Redirect to dashboard if user is not an admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t("admin.adminPanel")}</h1>
        
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={(value) => setActiveTab(value as "users" | "settings")}
          className="space-y-8"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {t("admin.users")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              {t("admin.settings")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-8">
            <UsersManagement />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-8">
            <AppSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;
