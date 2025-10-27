import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useApp } from '../../contexts/AppContext';
import { DollarSign, Calendar, CheckCircle, Clock, Edit, FileText, AlertCircle, Save } from 'lucide-react';

export const PaymentsAdmin: React.FC = () => {
  const { getFilteredPaymentRecords, getFilteredDocuments, updatePaymentRecord, suppliers, paymentsQueue } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // ✅ USAR COLA DE PAGOS REAL DESDE VISTA: vw_operations_payments_queue
  const paymentRecords = paymentsQueue || getFilteredPaymentRecords();
  const documents = getFilteredDocuments();

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.businessName || 'Proveedor no encontrado';
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Pagado</Badge>;
      case 'scheduled':
        return <Badge variant="info">Programado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  // 🔄 CALCULAR ESTADÍSTICAS BASADAS EN REGISTROS DE PAGOS
  const totalRecords = paymentRecords.length;
  const totalWithAmount = paymentRecords.filter(p => p.amount).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPaid = paymentRecords.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = paymentRecords.filter(p => p.paymentStatus !== 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCount = paymentRecords.filter(p => p.paymentStatus === 'pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          💰 Administrar Pagos - Solo Documentos Aprobados
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Como administrador, gestiona pagos de documentos ya validados y aprobados
        </p>
      </div>

      {/* Information Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-neo-info" />
            </div>
            <div>
              <h3 className="text-lg font-pt-serif font-bold text-neo-primary mb-2">
                🎯 Vista de Administrador - Solo Documentos Aprobados
              </h3>
              <p className="text-neo-gray-700 font-montserrat">
                Solo ves documentos que han sido validados y aprobados por el equipo de validación.
                Aquí puedes gestionar los pagos y completar la información faltante.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  Total Registros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 mr-4">
                <CheckCircle className="w-6 h-6 text-neo-success" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  S/ {totalPaid.toLocaleString()}
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
              <div className="p-3 rounded-lg bg-yellow-50 mr-4">
                <Clock className="w-6 h-6 text-neo-warning" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  S/ {totalPending.toLocaleString()}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Pendiente Pago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 mr-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-pt-serif font-bold text-neo-primary">
                  {pendingCount}
                </p>
                <p className="text-sm text-neo-gray-600 font-montserrat">
                  Por Completar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Gestión de Pagos - Números de Documento Extraídos</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-neo-gray-400" />
              </div>
              <p className="text-neo-gray-500 font-montserrat">
                No hay registros de pagos aún
              </p>
              <p className="text-sm text-neo-gray-400 font-montserrat mt-2">
                Los registros aparecerán automáticamente cuando los proveedores registren comprobantes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neo-gray-200">
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      🎯 Comprobante
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Proveedor
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Fecha Est. Pago
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Estado Pago
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Fecha Registro
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRecords.map((payment) => (
                    <tr key={payment.id} className="border-b border-neo-gray-100 hover:bg-neo-gray-50">
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
                        <p className="font-montserrat text-neo-gray-700">
                          {payment.supplierName || getSupplierName(payment.supplierId)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {payment.amount && payment.currency ? (
                          <p className="font-montserrat font-medium text-neo-primary">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-neo-gray-400 font-montserrat italic">
                              Por completar
                            </p>
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {payment.estimatedPaymentDate ? (
                          <p className="text-sm font-montserrat text-neo-gray-600">
                            {payment.estimatedPaymentDate.toLocaleDateString()}
                          </p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-neo-gray-400 font-montserrat italic">
                              Por definir
                            </p>
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {getPaymentStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-montserrat text-neo-gray-600">
                          {payment.createdAt ? payment.createdAt.toLocaleDateString() : 'Fecha no disponible'}
                        </p>
                        {payment.updatedAt && payment.createdAt && payment.updatedAt.getTime() !== payment.createdAt.getTime() && (
                          <p className="text-xs text-neo-gray-400 font-montserrat">
                            Actualizado: {payment.updatedAt.toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="🔄 Completar Información de Pago"
        size="medium"
      >
        {selectedPayment && (
          <EditPaymentForm
            payment={selectedPayment}
            onSubmit={(updates) => {
              updatePaymentRecord(selectedPayment.id, updates);
              setShowEditModal(false);
            }}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Edit Payment Form Component
const EditPaymentForm: React.FC<{
  payment: any;
  onSubmit: (updates: any) => void;
  onCancel: () => void;
}> = ({ payment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: payment.amount || '',
    currency: payment.currency || 'PEN',
    estimatedPaymentDate: payment.estimatedPaymentDate && payment.estimatedPaymentDate instanceof Date 
      ? payment.estimatedPaymentDate.toLocaleDateString('en-CA') 
      : '',
    actualPaymentDate: payment.actualPaymentDate && payment.actualPaymentDate instanceof Date 
      ? payment.actualPaymentDate.toLocaleDateString('en-CA') 
      : '',
    paymentStatus: payment.paymentStatus,
    paymentMethod: payment.paymentMethod || '',
    bankAccount: payment.bankAccount || '',
    notes: payment.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      currency: formData.currency,
      estimatedPaymentDate: formData.estimatedPaymentDate ? new Date(formData.estimatedPaymentDate) : undefined,
      actualPaymentDate: formData.actualPaymentDate ? new Date(formData.actualPaymentDate) : undefined,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod || undefined,
      bankAccount: formData.bankAccount || undefined,
      notes: formData.notes || undefined
    };

    onSubmit(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neo-gray-50 rounded-lg p-4">
        <h4 className="font-montserrat font-semibold text-neo-primary mb-2">
          🎯 Comprobante: {payment.documentNumber}
        </h4>
        <p className="text-sm text-neo-gray-600 font-montserrat">
          Proveedor: {payment.supplierName}
        </p>
        <p className="text-sm text-neo-gray-600 font-montserrat">
          Registrado: {payment.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Monto
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Moneda
          </label>
          <select
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.currency}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
          >
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Estado del Pago
          </label>
          <select
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.paymentStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
          >
            <option value="pending">Pendiente</option>
            <option value="scheduled">Programado</option>
            <option value="paid">Pagado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Método de Pago
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            placeholder="Ej: Transferencia bancaria"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Fecha Estimada de Pago
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.estimatedPaymentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedPaymentDate: e.target.value }))}
          />
        </div>

        {formData.paymentStatus === 'paid' && (
          <div>
            <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
              Fecha Real de Pago
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
              value={formData.actualPaymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, actualPaymentDate: e.target.value }))}
              required
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Cuenta Bancaria
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.bankAccount}
            onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
            placeholder="Ej: BCP - Cuenta Corriente Soles"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Notas
          </label>
          <textarea
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent resize-none"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notas adicionales sobre el pago..."
          />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-neo-success flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-montserrat font-medium text-green-800 mb-1">
              🔄 Sincronización Automática
            </h4>
            <p className="text-sm text-green-700 font-montserrat">
              Los cambios se reflejarán automáticamente en la vista del proveedor y se enviarán notificaciones correspondientes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};