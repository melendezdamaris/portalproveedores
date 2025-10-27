import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, Calendar, CheckCircle, Clock, FileText, AlertCircle, Award } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { getFilteredPaymentRecords, getFilteredDocuments } = useApp();
  const { user } = useAuth();

  // 🔄 USAR DATOS FILTRADOS POR ROL
  const userPaymentRecords = getFilteredPaymentRecords();
  const documents = getFilteredDocuments();
  
  // Calcular estadísticas basadas en registros de pago
  const totalRecords = userPaymentRecords.length;
  const scheduledPayments = userPaymentRecords.filter(payment => payment.paymentStatus === 'scheduled');
  const paidPayments = userPaymentRecords.filter(payment => payment.paymentStatus === 'paid');
  const pendingPayments = userPaymentRecords.filter(payment => payment.paymentStatus === 'pending');
  
  const totalScheduledAmount = scheduledPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalPaidAmount = paidPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">💰 Pagado</Badge>;
      case 'scheduled':
        return <Badge variant="info">📅 Programado</Badge>;
      case 'pending':
        return <Badge variant="warning">⏳ Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Obtener estado de aprobación del documento
  const getDocumentApprovalStatus = (paymentId: string) => {
    const document = documents.find(doc => doc.id === paymentId);
    if (!document) {
      return <Badge variant="warning">⏳ En validación</Badge>;
    }

    switch (document.status) {
      case 'approved':
      case 'aprobado':
        return <Badge variant="success">✅ Validado</Badge>;
      case 'pending':
      case 'pendiente':
        return <Badge variant="warning">⏳ Pendiente</Badge>;
      case 'rejected':
      case 'rechazado':
        return <Badge variant="danger">❌ Rechazado</Badge>;
      default:
        return <Badge>{document.status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-neo-success" />;
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-neo-info" />;
      default:
        return <Clock className="w-5 h-5 text-neo-warning" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          💳 Estado de Pagos - Mis Comprobantes
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Seguimiento de tus comprobantes registrados y estado de pagos
        </p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 mr-4">
                <FileText className="w-6 h-6 text-neo-info" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  {totalRecords}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Total Registrados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 mr-4">
                <DollarSign className="w-6 h-6 text-neo-success" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  S/ {totalPaidAmount.toLocaleString()}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Total Pagado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 mr-4">
                <Calendar className="w-6 h-6 text-neo-info" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  S/ {totalScheduledAmount.toLocaleString()}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Programado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50 mr-4">
                <Clock className="w-6 h-6 text-neo-warning" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  {pendingPayments.length}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Pendientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Detalle de Pagos - Sincronizado Automáticamente</CardTitle>
        </CardHeader>
        <CardContent>
          {userPaymentRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-neo-gray-400" />
              </div>
              <p className="text-neo-gray-500 font-montserrat">
                No hay comprobantes registrados aún
              </p>
              <p className="text-sm text-neo-gray-400 font-montserrat mt-2">
                Los comprobantes aparecerán aquí automáticamente al registrarlos
              </p>
            </div>
          ) : (
            <>
              {/* Information Banner */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-neo-info flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-montserrat font-medium text-blue-800 mb-1">
                      🔄 Sincronización Automática
                    </h4>
                    <p className="text-sm font-montserrat text-blue-700">
                      Esta tabla se actualiza automáticamente cuando registra un comprobante. 
                      Los campos de monto y fechas son completados por el equipo de Operaciones tras la aprobación.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neo-gray-200">
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        📅 Fecha Registro
                      </th>
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        🎯 Comprobante
                      </th>
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        Monto
                      </th>
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        Fecha Est. Pago
                      </th>
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        Estado del Pago
                      </th>
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        ✅ Estado de Validación
                      </th>
                      <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPaymentRecords.map((payment) => (
                      <tr key={payment.id} className="border-b border-neo-gray-100 hover:bg-neo-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-neo-accent" />
                            <div>
                              <p className="text-sm font-montserrat font-medium text-neo-primary">
                                {payment.createdAt.toLocaleDateString()}
                              </p>
                              {payment.updatedAt && payment.updatedAt.getTime() !== payment.createdAt.getTime() && (
                                <p className="text-xs text-neo-gray-400 font-montserrat">
                                  Actualizado: {payment.updatedAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(payment.paymentStatus)}
                            <div>
                              <p className="font-montserrat font-medium text-neo-primary">
                                🎯 {payment.documentNumber}
                              </p>
                              {payment.documentType && (
                                <p className="text-sm text-neo-gray-600 font-montserrat capitalize">
                                  {payment.documentType}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {payment.amount && payment.currency ? (
                            <p className="font-montserrat font-medium text-neo-primary">
                              {payment.currency} {payment.amount.toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-sm text-neo-gray-400 font-montserrat italic">
                              Por completar
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {payment.estimatedPaymentDate ? (
                            <div>
                              <p className="text-sm font-montserrat text-neo-gray-600">
                                {payment.estimatedPaymentDate.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-neo-gray-400 font-montserrat">
                                ({formatDistanceToNow(payment.estimatedPaymentDate, { addSuffix: true, locale: es })})
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-neo-gray-400 font-montserrat italic">
                              Por definir
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col space-y-1">
                            {getPaymentStatusBadge(payment.paymentStatus)}
                            {payment.paymentStatus === 'paid' && (
                              <p className="text-xs text-neo-success font-montserrat">
                                ✅ Tu factura ha sido pagada correctamente
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-neo-accent" />
                            {getDocumentApprovalStatus(payment.id)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {payment.notes ? (
                            <p className="text-sm font-montserrat text-neo-gray-600">
                              {payment.notes}
                            </p>
                          ) : (
                            <p className="text-sm text-neo-gray-400 font-montserrat italic">
                              Sin notas
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Estado de Flujo Completo */}
      <Card className="bg-gradient-to-r from-neo-primary to-neo-accent text-white">
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-white" />
              <h3 className="text-xl font-pt-serif font-bold">
                📊 Estados del Flujo Completo
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estados de Validación */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-lg font-pt-serif font-semibold mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Estados de Validación
                </h4>
                <div className="space-y-2 text-sm font-montserrat">
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-200">⏳</span>
                    <div>
                      <strong>Pendiente:</strong> Tu comprobante está en revisión por el validador
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-200">✅</span>
                    <div>
                      <strong>Validado:</strong> Tu comprobante fue aprobado y pasó a operaciones
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-200">❌</span>
                    <div>
                      <strong>Rechazado:</strong> Tu comprobante requiere correcciones
                    </div>
                  </div>
                </div>
              </div>

              {/* Estados de Pago */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-lg font-pt-serif font-semibold mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Estados de Pago
                </h4>
                <div className="space-y-2 text-sm font-montserrat">
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-200">⏳</span>
                    <div>
                      <strong>Pendiente:</strong> Esperando programación de pago
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-200">📅</span>
                    <div>
                      <strong>Programado:</strong> Pago programado para fecha específica
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-200">💰</span>
                    <div>
                      <strong>Pagado:</strong> ¡Tu factura ha sido pagada correctamente!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4 border-2 border-white border-opacity-30">
              <h4 className="text-lg font-pt-serif font-semibold mb-2">
                🔄 Flujo Completo del Proceso
              </h4>
              <div className="space-y-1 text-sm font-montserrat">
                <p><strong>1. Registro:</strong> Subes tu comprobante con factura y entregables</p>
                <p><strong>2. Validación:</strong> El validador revisa y aprueba/rechaza tu documento</p>
                <p><strong>3. Programación:</strong> Operaciones programa la fecha de pago</p>
                <p><strong>4. Pago:</strong> Se ejecuta el pago y recibes notificación automática</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};