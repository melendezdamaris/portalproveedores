import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';

export const FeedbackView: React.FC = () => {
  const { submitFeedback } = useApp();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ratings, setRatings] = useState({
    communication: 0,
    paymentTiming: 0,
    platformUsability: 0,
    overallSatisfaction: 0
  });
  const [feedback, setFeedback] = useState({
    comments: '',
    suggestions: ''
  });

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const averageRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / 4;
    
    submitFeedback({
      supplierId: user?.id || '550e8400-e29b-41d4-a716-446655440001',
      supplierName: user?.name || 'Usuario',
      rating: averageRating,
      communication: ratings.communication,
      paymentTiming: ratings.paymentTiming,
      platformUsability: ratings.platformUsability,
      overallSatisfaction: ratings.overallSatisfaction,
      comments: feedback.comments,
      suggestions: feedback.suggestions
    })
    .then(() => {
      console.log('✅ Feedback enviado exitosamente');
      setIsSubmitted(true);
    })
    .catch((error) => {
      console.error('❌ Error enviando feedback:', error);
      alert(`Error enviando feedback: ${error.message}`);
    });
  };

  const renderStarRating = (category: string, value: number, label: string, description: string) => {
    return (
      <div className="space-y-2">
        <div>
          <h4 className="font-montserrat font-medium text-neo-primary">{label}</h4>
          <p className="text-sm text-neo-gray-600 font-montserrat">{description}</p>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(category, star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= value
                    ? 'text-neo-warning fill-current'
                    : 'text-neo-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent padding="large">
            <div className="w-16 h-16 bg-neo-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-neo-success" />
            </div>
            <h2 className="text-2xl font-pt-serif font-bold text-neo-primary mb-4">
              ¡Gracias por tu Feedback!
            </h2>
            <p className="text-neo-gray-600 font-montserrat mb-6">
              Tu opinión es muy valiosa para nosotros. Utilizaremos tus comentarios 
              para mejorar continuamente nuestros servicios y procesos.
            </p>
            <Button onClick={() => {
              setIsSubmitted(false);
              setRatings({
                communication: 0,
                paymentTiming: 0,
                platformUsability: 0,
                overallSatisfaction: 0
              });
              setFeedback({ comments: '', suggestions: '' });
            }}>
              Enviar Otra Encuesta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          Encuesta de Feedback
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Ayúdanos a mejorar nuestra plataforma y servicios con tu opinión
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluación de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Categories */}
            <div className="grid gap-8">
              {renderStarRating(
                'communication',
                ratings.communication,
                'Comunicación',
                '¿Qué tan efectiva es la comunicación con nuestro equipo?'
              )}
              
              {renderStarRating(
                'paymentTiming',
                ratings.paymentTiming,
                'Puntualidad de Pagos',
                '¿Cómo calificas la puntualidad en los pagos?'
              )}
              
              {renderStarRating(
                'platformUsability',
                ratings.platformUsability,
                'Facilidad de Uso del Portal',
                '¿Qué tan fácil es usar esta plataforma?'
              )}
              
              {renderStarRating(
                'overallSatisfaction',
                ratings.overallSatisfaction,
                'Satisfacción General',
                '¿Cuál es tu nivel de satisfacción general con NEO Consulting?'
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
                  Comentarios Adicionales
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent resize-none"
                  rows={4}
                  placeholder="Comparte tu experiencia, aspectos positivos o áreas de mejora..."
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
                  Sugerencias de Mejora
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent resize-none"
                  rows={4}
                  placeholder="¿Qué funcionalidades o mejoras te gustaría ver en el futuro?"
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="large"
                disabled={Object.values(ratings).some(rating => rating === 0)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-neo-gray-50 border-neo-gray-200">
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-neo-accent" />
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-neo-primary mb-2">
                Tu opinión importa
              </h3>
              <p className="text-sm text-neo-gray-600 font-montserrat">
                Este feedback es completamente anónimo y será utilizado únicamente para 
                mejorar nuestros servicios. Agradecemos tu tiempo y honestidad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};