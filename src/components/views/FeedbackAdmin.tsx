import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useApp } from '../../contexts/AppContext';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';

export const FeedbackAdmin: React.FC = () => {
  const { feedbackSurveys } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data for demonstration
  const mockFeedback = [
    {
      id: '1',
      supplierId: '1',
      supplierName: 'Empresa ABC SAC',
      rating: 4.5,
      communication: 5,
      paymentTiming: 4,
      platformUsability: 4,
      overallSatisfaction: 5,
      comments: 'Excelente servicio y comunicación. Los pagos siempre son puntuales.',
      suggestions: 'Sería útil tener notificaciones push en el móvil.',
      submittedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      supplierId: '2',
      supplierName: 'Consultores XYZ EIRL',
      rating: 3.8,
      communication: 4,
      paymentTiming: 3,
      platformUsability: 4,
      overallSatisfaction: 4,
      comments: 'En general bien, pero a veces los pagos se demoran un poco.',
      suggestions: 'Mejorar los tiempos de pago y tener más claridad en el estado de los comprobantes.',
      submittedAt: new Date('2024-11-28')
    }
  ];

  const allFeedback = [...feedbackSurveys, ...mockFeedback];

  const calculateAverages = () => {
    if (allFeedback.length === 0) return null;
    
    const totals = allFeedback.reduce((acc, feedback) => ({
      communication: acc.communication + feedback.communication,
      paymentTiming: acc.paymentTiming + feedback.paymentTiming,
      platformUsability: acc.platformUsability + feedback.platformUsability,
      overallSatisfaction: acc.overallSatisfaction + feedback.overallSatisfaction
    }), { communication: 0, paymentTiming: 0, platformUsability: 0, overallSatisfaction: 0 });

    const count = allFeedback.length;
    return {
      communication: (totals.communication / count).toFixed(1),
      paymentTiming: (totals.paymentTiming / count).toFixed(1),
      platformUsability: (totals.platformUsability / count).toFixed(1),
      overallSatisfaction: (totals.overallSatisfaction / count).toFixed(1),
      overall: ((totals.communication + totals.paymentTiming + totals.platformUsability + totals.overallSatisfaction) / (count * 4)).toFixed(1)
    };
  };

  const averages = calculateAverages();

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-neo-warning fill-current'
                : 'text-neo-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge variant="success">Excelente</Badge>;
    if (rating >= 3.5) return <Badge variant="info">Bueno</Badge>;
    if (rating >= 2.5) return <Badge variant="warning">Regular</Badge>;
    return <Badge variant="danger">Necesita Mejora</Badge>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          Encuestas de Feedback
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Analiza las opiniones y sugerencias de los proveedores
        </p>
      </div>

      {/* Summary Stats */}
      {averages && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card hover>
            <CardContent>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {renderStars(parseFloat(averages.overall))}
                </div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  {averages.overall}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Promedio General
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {renderStars(parseFloat(averages.communication))}
                </div>
                <p className="text-xl font-pt-serif font-bold text-neo-primary">
                  {averages.communication}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Comunicación
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {renderStars(parseFloat(averages.paymentTiming))}
                </div>
                <p className="text-xl font-pt-serif font-bold text-neo-primary">
                  {averages.paymentTiming}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Puntualidad Pagos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {renderStars(parseFloat(averages.platformUsability))}
                </div>
                <p className="text-xl font-pt-serif font-bold text-neo-primary">
                  {averages.platformUsability}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Usabilidad Portal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {renderStars(parseFloat(averages.overallSatisfaction))}
                </div>
                <p className="text-xl font-pt-serif font-bold text-neo-primary">
                  {averages.overallSatisfaction}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Satisfacción General
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Detallado ({allFeedback.length} respuestas)</CardTitle>
        </CardHeader>
        <CardContent>
          {allFeedback.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-neo-gray-400" />
              </div>
              <p className="text-neo-gray-500 font-montserrat">
                No hay encuestas de feedback aún
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {allFeedback.map((feedback) => (
                <div key={feedback.id} className="border border-neo-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-pt-serif font-bold text-neo-primary">
                        {feedback.supplierName}
                      </h3>
                      <p className="text-sm text-neo-gray-600 font-montserrat">
                        Enviado el {feedback.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getRatingBadge(feedback.rating)}
                      <div className="flex items-center space-x-1">
                        {renderStars(feedback.rating)}
                        <span className="text-sm font-montserrat text-neo-gray-600 ml-2">
                          {feedback.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {renderStars(feedback.communication)}
                      </div>
                      <p className="text-sm font-montserrat text-neo-gray-600">
                        Comunicación
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {renderStars(feedback.paymentTiming)}
                      </div>
                      <p className="text-sm font-montserrat text-neo-gray-600">
                        Puntualidad Pagos
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {renderStars(feedback.platformUsability)}
                      </div>
                      <p className="text-sm font-montserrat text-neo-gray-600">
                        Usabilidad Portal
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {renderStars(feedback.overallSatisfaction)}
                      </div>
                      <p className="text-sm font-montserrat text-neo-gray-600">
                        Satisfacción General
                      </p>
                    </div>
                  </div>

                  {feedback.comments && (
                    <div className="mb-4">
                      <h4 className="font-montserrat font-semibold text-neo-primary mb-2">
                        Comentarios:
                      </h4>
                      <p className="text-neo-gray-700 font-montserrat bg-neo-gray-50 p-3 rounded-lg">
                        {feedback.comments}
                      </p>
                    </div>
                  )}

                  {feedback.suggestions && (
                    <div>
                      <h4 className="font-montserrat font-semibold text-neo-primary mb-2">
                        Sugerencias:
                      </h4>
                      <p className="text-neo-gray-700 font-montserrat bg-blue-50 p-3 rounded-lg">
                        {feedback.suggestions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {allFeedback.length > 0 && (
        <Card className="bg-gradient-to-r from-neo-primary to-neo-accent text-white">
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-pt-serif font-bold mb-3">
                  Insights y Recomendaciones
                </h3>
                <div className="space-y-2 text-sm font-montserrat">
                  {parseFloat(averages?.paymentTiming || '0') < 4 && (
                    <p>• Considerar mejorar los tiempos de pago para aumentar la satisfacción</p>
                  )}
                  {parseFloat(averages?.communication || '0') >= 4.5 && (
                    <p>• Excelente comunicación - mantener este estándar</p>
                  )}
                  {parseFloat(averages?.platformUsability || '0') < 4 && (
                    <p>• Evaluar mejoras en la usabilidad del portal</p>
                  )}
                  <p>• Total de proveedores que han enviado feedback: {allFeedback.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};