import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    const success = await requestPasswordReset(email);
    if (success) {
      setIsSubmitted(true);
    } else {
      setError('No se encontró una cuenta con este correo electrónico');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neo-primary via-neo-accent to-neo-info flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in text-center">
          <div className="w-16 h-16 bg-neo-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-neo-success" />
          </div>
          <h2 className="text-2xl font-pt-serif font-bold text-neo-primary mb-4">
            Correo Enviado
          </h2>
          <p className="text-neo-gray-600 font-montserrat mb-6">
            Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>
          </p>
          <Button onClick={onBack} variant="secondary" className="w-full">
            Volver al Inicio de Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neo-primary via-neo-accent to-neo-info flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center text-neo-gray-600 hover:text-neo-primary mb-6 font-montserrat transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neo-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-pt-serif font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-pt-serif font-bold text-neo-primary mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-neo-gray-600 font-montserrat">
            Ingresa tu correo para recibir instrucciones
          </p>
        </div>

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
            Enviar Instrucciones
          </Button>
        </form>
      </div>
    </div>
  );
};