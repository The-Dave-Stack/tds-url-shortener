
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Error de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth}>
      <div className="space-y-4 pt-4">
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
      </div>
      
      <div className="flex flex-col gap-4 pt-6">
        <Button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600"
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : t('auth.signIn')}
        </Button>
        <div className="text-center text-sm">
          <Link to="/" className="text-brand-500 hover:underline">
            {t('common.back')}
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
