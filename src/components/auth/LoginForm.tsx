import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa todos los campos');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Credenciales incorrectas. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neo-primary via-neo-accent to-neo-info flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neo-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-pt-serif font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-pt-serif font-bold text-neo-primary mb-2">
            NEO Consulting
          </h1>
          <p className="text-neo-gray-600 font-montserrat">
            Portal de Proveedores
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-neo-gray-400" />
            </div>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-neo-gray-400" />
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-neo-gray-400 hover:text-neo-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-neo-gray-400 hover:text-neo-gray-600" />
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-montserrat">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="large"
            isLoading={isLoading}
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={onForgotPassword}
            className="text-neo-accent hover:text-neo-primary font-montserrat text-sm transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-neo-gray-50 rounded-lg p-4">
          <h3 className="font-montserrat font-semibold text-neo-primary text-sm mb-2">
            Credenciales de Demo:
          </h3>
          <div className="space-y-1 text-xs font-montserrat text-neo-gray-600">
            <p><strong>Proveedor:</strong> proveedor@example.com</p>
            <p><strong>Operaciones:</strong> operaciones@neoconsulting.com</p>
            <p><strong>Aprobador:</strong> aprobador@neoconsulting.com</p>
            <p><strong>Contraseña:</strong> password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};