
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { t } = useTranslation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <Tabs
            defaultValue={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {activeTab === 'login' ? t('auth.signIn') : t('auth.signUp')}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'login' 
                  ? t('auth.signIn') 
                  : t('auth.signUp')}
              </CardDescription>
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <form onSubmit={handleAuth}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('auth.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t('auth.password')}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : activeTab === 'login' ? t('auth.signIn') : t('auth.signUp')}
                </Button>
                <div className="text-center text-sm">
                  <Link to="/" className="text-brand-500 hover:underline">
                    {t('common.back')}
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
