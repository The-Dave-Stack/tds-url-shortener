
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RegistrationAlertProps {
  registrationEnabled: boolean;
}

const RegistrationAlert = ({ registrationEnabled }: RegistrationAlertProps) => {
  const { t } = useTranslation();

  if (!registrationEnabled) return null;
  
  return (
    <Alert variant="default" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {t('auth.registrationAvailable')}
      </AlertDescription>
    </Alert>
  );
};

export default RegistrationAlert;
