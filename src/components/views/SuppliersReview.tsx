import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { Building2, CheckCircle, XCircle, Eye, Mail, Phone } from 'lucide-react';

export const SuppliersReview: React.FC = () => {
  const { suppliers, approveSupplier } = useApp();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const pendingSuppliers = suppliers.filter(supplier => supplier.status === 'pending');

  const handleReview = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowReviewModal(true);
  };

  const handleApprove = (supplierId: string) => {
    approveSupplier(supplierId);
    setShowReviewModal(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          Revisar Proveedores
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Revisa y aprueba las solicitudes de registro de nuevos proveedores
        </p>
      </div>

      {/* Pending Count */}
      {pendingSuppliers.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Building2 className="w-8 h-8 text-neo-warning" />
              </div>
              <div>
                <h3 className="text-lg font-pt-serif font-bold text-neo-primary">
                  {pendingSuppliers.length} proveedor{pendingSuppliers.length !== 1 ? 'es' : ''} pendiente{pendingSuppliers.length !== 1 ? 's' : ''} de revisión
                </h3>
                <p className="text-neo-gray-600 font-montserrat">
                  Revisa la información de registro para aprobar o rechazar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers List */}
      <div className="space-y-6">
        {pendingSuppliers.length === 0 ? (
          <Card>
            <CardContent padding="large">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-neo-gray-400" />
                </div>
                <h3 className="text-lg font-pt-serif font-semibold text-neo-primary mb-2">
                  ¡Todo revisado!
                </h3>
                <p className="text-neo-gray-500 font-montserrat">
                  No hay proveedores pendientes de revisión
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          pendingSuppliers.map((supplier) => (
            <Card key={supplier.id} className="border-l-4 border-l-neo-warning">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <Building2 className="w-6 h-6 text-neo-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-pt-serif font-bold text-neo-primary">
                          {supplier.businessName}
                        </h3>
                        <Badge variant="warning">Pendiente Revisión</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            RUC
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {supplier.ruc}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Nombre Comercial
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {supplier.tradeName || 'No especificado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Email
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {supplier.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Fecha Registro
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {supplier.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500 mb-1">
                          Dirección
                        </p>
                        <p className="font-montserrat text-neo-gray-700">
                          {supplier.address}
                        </p>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-neo-gray-400" />
                          <span className="text-sm font-montserrat text-neo-gray-600">
                            {supplier.contactEmail}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-neo-gray-400" />
                          <span className="text-sm font-montserrat text-neo-gray-600">
                            {supplier.contactPhone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button 
                      size="small" 
                      variant="secondary"
                      onClick={() => handleReview(supplier)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Revisar
                    </Button>
                    <Button 
                      size="small" 
                      variant="success"
                      onClick={() => handleApprove(supplier.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Revisar Proveedor"
        size="large"
      >
        {selectedSupplier && (
          <SupplierReviewDetails
            supplier={selectedSupplier}
            onApprove={() => handleApprove(selectedSupplier.id)}
            onClose={() => setShowReviewModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Supplier Review Details Component
const SupplierReviewDetails: React.FC<{
  supplier: any;
  onApprove: () => void;
  onClose: () => void;
}> = ({ supplier, onApprove, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="bg-neo-gray-50 rounded-lg p-4">
        <h3 className="text-xl font-pt-serif font-bold text-neo-primary mb-2">
          {supplier.businessName}
        </h3>
        <div className="flex items-center space-x-4">
          <Badge variant="warning">Pendiente Revisión</Badge>
          <span className="text-sm text-neo-gray-600 font-montserrat">
            Registrado el {supplier.createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2">
            Información de la Empresa
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">RUC</label>
              <p className="font-montserrat text-neo-primary">{supplier.ruc}</p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Razón Social</label>
              <p className="font-montserrat text-neo-primary">{supplier.businessName}</p>
            </div>
            {supplier.tradeName && (
              <div>
                <label className="text-sm font-montserrat font-medium text-neo-gray-500">Nombre Comercial</label>
                <p className="font-montserrat text-neo-primary">{supplier.tradeName}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Dirección</label>
              <p className="font-montserrat text-neo-primary">{supplier.address}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2">
            Información de Contacto
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Teléfono Empresa</label>
              <p className="font-montserrat text-neo-primary">{supplier.phone}</p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Email Empresa</label>
              <p className="font-montserrat text-neo-primary">{supplier.email}</p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Persona de Contacto</label>
              <p className="font-montserrat text-neo-primary">{supplier.contactPerson}</p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Teléfono Contacto</label>
              <p className="font-montserrat text-neo-primary">{supplier.contactPhone}</p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Email Contacto</label>
              <p className="font-montserrat text-neo-primary">{supplier.contactEmail}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2">
          Información Bancaria
        </h4>
        <div className="space-y-4">
          {supplier.bankAccounts.map((account: any, index: number) => (
            <div key={account.id} className="bg-white border border-neo-gray-200 rounded-lg p-4">
              <h5 className="font-montserrat font-medium text-neo-primary mb-3">
                Cuenta {index + 1}
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-montserrat font-medium text-neo-gray-500">Banco</label>
                  <p className="font-montserrat text-neo-primary">{account.bankName}</p>
                </div>
                <div>
                  <label className="text-sm font-montserrat font-medium text-neo-gray-500">Número de Cuenta</label>
                  <p className="font-montserrat text-neo-primary">{account.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-montserrat font-medium text-neo-gray-500">Tipo de Cuenta</label>
                  <p className="font-montserrat text-neo-primary capitalize">{account.accountType}</p>
                </div>
                <div>
                  <label className="text-sm font-montserrat font-medium text-neo-gray-500">Moneda</label>
                  <p className="font-montserrat text-neo-primary">{account.currency}</p>
                </div>
                {account.cci && (
                  <div className="col-span-2">
                    <label className="text-sm font-montserrat font-medium text-neo-gray-500">CCI</label>
                    <p className="font-montserrat text-neo-primary">{account.cci}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-neo-success flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-montserrat font-medium text-green-800 mb-1">
              Al aprobar este proveedor:
            </h4>
            <ul className="text-sm text-green-700 font-montserrat space-y-1">
              <li>• El proveedor podrá acceder al portal</li>
              <li>• Podrá registrar comprobantes</li>
              <li>• Se habilitarán todas las funcionalidades</li>
              <li>• Se enviará notificación de aprobación</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="success" onClick={onApprove}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Aprobar Proveedor
        </Button>
      </div>
    </div>
  );
};