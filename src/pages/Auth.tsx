
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { checkRegistrationAllowed } from '@/utils/auth-utils';
import LoginForm from '@/components/auth/LoginForm';
import RegistrationAlert from '@/components/auth/RegistrationAlert';

const Auth = () => {
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const isAllowed = await checkRegistrationAllowed(t);
        console.log('Registration allowed:', isAllowed);
        setRegistrationEnabled(isAllowed);
      } catch (error) {
        console.error('Error checking registration status:', error);
        setRegistrationEnabled(false);
      }
    };

    checkRegistrationStatus();
  }, [t]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t('auth.signIn')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.signIn')}
            </CardDescription>
            
            {/* The RegistrationAlert will only show if registration is enabled */}
            <RegistrationAlert registrationEnabled={registrationEnabled} />
          </CardHeader>
          
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
