
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { getAppSettings, updateAppSettings, AppSettings as AppSettingsType } from "@/utils/admin";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings2 } from "lucide-react";

const AppSettings = () => {
  const [settings, setSettings] = useState<AppSettingsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [timeout, setTimeout] = useState(30);
  const [maxConnections, setMaxConnections] = useState(50);
  const { user } = useAuth();
  const { t } = useTranslation();

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("Loading app settings...");
        const appSettings = await getAppSettings();
        console.log("App settings loaded:", appSettings);
        setSettings(appSettings);
        
        // Initialize form values from settings
        const registrationSetting = appSettings.find(s => s.key === 'allow_registration');
        if (registrationSetting) {
          console.log("Registration setting found:", registrationSetting);
          setRegistrationEnabled(registrationSetting.value.enabled === true);
        }
        
        const connectionSetting = appSettings.find(s => s.key === 'connection_settings');
        if (connectionSetting) {
          setTimeout(connectionSetting.value.timeout);
          setMaxConnections(connectionSetting.value.max_connections);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [t]);

  // Handle registration setting change
  const handleRegistrationToggle = async () => {
    if (!user) return;
    
    try {
      console.log("Toggling registration:", !registrationEnabled);
      const newValue = {
        enabled: !registrationEnabled
      };
      
      await updateAppSettings('allow_registration', newValue, user.id);
      setRegistrationEnabled(!registrationEnabled);
      toast.success(t("admin.settingsUpdated"));
    } catch (error) {
      console.error("Error updating registration setting:", error);
      toast.error(t("common.error"));
    }
  };

  // Handle connection settings change
  const handleConnectionSettingsSave = async () => {
    if (!user) return;
    
    try {
      const newValue = {
        timeout: timeout,
        max_connections: maxConnections
      };
      
      await updateAppSettings('connection_settings', newValue, user.id);
      toast.success(t("admin.settingsUpdated"));
    } catch (error) {
      console.error("Error updating connection settings:", error);
      toast.error(t("common.error"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("admin.settings")}</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("auth.signUp")}</CardTitle>
            <CardDescription>
              {t("admin.registrationEnabled")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Switch
                checked={registrationEnabled}
                onCheckedChange={handleRegistrationToggle}
                id="registration-switch"
              />
              <label htmlFor="registration-switch">
                {registrationEnabled 
                  ? t("admin.registrationEnabled") 
                  : t("admin.registrationDisabled")
                }
              </label>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.connectionSettings")}</CardTitle>
            <CardDescription>
              <Settings2 className="h-4 w-4 inline mr-1" />
              {t("admin.connectionSettings")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="timeout">{t("admin.timeout")}</label>
                <Input
                  id="timeout"
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value) || 30)}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="max-connections">{t("admin.maxConnections")}</label>
                <Input
                  id="max-connections"
                  type="number"
                  value={maxConnections}
                  onChange={(e) => setMaxConnections(parseInt(e.target.value) || 50)}
                  min={1}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConnectionSettingsSave}>
              {t("common.save")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AppSettings;
