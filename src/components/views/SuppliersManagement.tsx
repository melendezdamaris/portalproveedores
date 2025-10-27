import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useApp } from '../../contexts/AppContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  Plus, 
  Search,
  Filter,
  Eye,
  Key,
  CheckCircle,
  XCircle,
  CreditCard,
  MapPin,
  FileText,
  Upload,
  Download,
  AlertCircle
} from 'lucide-react';

export const SuppliersManagement: React.FC = () => {
  const { getFilteredSuppliers, addSupplier, approveSupplier, disableSupplier, resetSupplierPassword } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 🔄 USAR PROVEEDORES FILTRADOS POR ROL
  const suppliers = getFilteredSuppliers();

  const handleSupplierClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const handleApprove = (supplierId: string) => {
    approveSupplier(supplierId);
    setShowDetailModal(false);
  };

  const handleDisable = (supplierId: string) => {
    disableSupplier(supplierId);
    setShowDetailModal(false);
  };

  const handleResetPassword = (supplierId: string) => {
    resetSupplierPassword(supplierId);
    setShowDetailModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprobado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rechazado</Badge>;
      case 'disabled':
        return <Badge variant="danger">Deshabilitado</Badge>;
      case 'pending_configuration':
        return <Badge variant="info">Pendiente Configuración</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neo-primary font-pt-serif">
            🏢 Gestión de Proveedores - Solo Aprobados
          </h1>
          <p className="text-neo-gray-600 font-montserrat">
            Como administrador, gestiona proveedores que han sido aprobados por el equipo de validación
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-neo-gray-100 text-neo-primary rounded-lg hover:bg-neo-gray-200 transition-colors duration-200 flex items-center space-x-2"
            onClick={() => setShowQuickAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Registro Rápido</span>
          </button>
          <button 
            className="px-4 py-2 bg-neo-primary text-white rounded-lg hover:bg-neo-primary-dark transition-colors duration-200 flex items-center space-x-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Proveedor Completo</span>
          </button>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="shadow-lg border-0 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neo-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUC o email..."
                  className="w-full pl-12 pr-4 py-3 border border-neo-gray-300 rounded-xl font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-neo-gray-600">
                <Filter className="w-5 h-5" />
                <span className="font-montserrat font-medium">Filtrar:</span>
              </div>
              <select
                className="px-4 py-3 border border-neo-gray-300 rounded-xl font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md min-w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
                <option value="disabled">Deshabilitados</option>
                <option value="pending_configuration">Pendiente Configuración</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Suppliers Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-neo-primary to-neo-accent text-white rounded-t-xl">
          <CardTitle className="text-white font-pt-serif text-xl">
            Lista de Proveedores ({filteredSuppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-neo-gray-400" />
              </div>
              <h3 className="text-xl font-pt-serif font-semibold text-neo-primary mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron proveedores'
                  : 'No hay proveedores registrados'
                }
              </h3>
              <p className="text-neo-gray-500 font-montserrat">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza registrando tu primer proveedor'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neo-gray-200 bg-neo-gray-50">
                    <th className="text-left py-4 px-6 font-montserrat font-semibold text-neo-primary">
                      Proveedor
                    </th>
                    <th className="text-left py-4 px-6 font-montserrat font-semibold text-neo-primary">
                      RUC / Tipo
                    </th>
                    <th className="text-left py-4 px-6 font-montserrat font-semibold text-neo-primary">
                      Contacto
                    </th>
                    <th className="text-left py-4 px-6 font-montserrat font-semibold text-neo-primary">
                      País / Servicio
                    </th>
                    <th className="text-left py-4 px-6 font-montserrat font-semibold text-neo-primary">
                      Estado
                    </th>
                    <th className="text-left py-4 px-6 font-montserrat font-semibold text-neo-primary">
                      Fecha Registro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, index) => (
                    <tr 
                      key={supplier.id} 
                      className={`border-b border-neo-gray-100 hover:bg-neo-gray-50 transition-colors duration-200 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white' : 'bg-neo-gray-25'
                      }`}
                      onClick={() => handleSupplierClick(supplier)}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-neo-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-neo-accent" />
                          </div>
                          <div>
                            <p className="font-montserrat font-semibold text-neo-primary text-base">
                              {supplier.businessName}
                            </p>
                            {supplier.tradeName && (
                              <p className="text-sm text-neo-gray-600 font-montserrat mt-1">
                                {supplier.tradeName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <p className="font-montserrat font-medium text-neo-gray-700">{supplier.ruc}</p>
                          <p className="text-sm text-neo-gray-500 font-montserrat capitalize">
                            {supplier.personType || 'Jurídica'}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-neo-gray-400" />
                            <p className="text-sm font-montserrat text-neo-gray-600">
                              {supplier.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-neo-gray-400" />
                            <p className="text-sm font-montserrat text-neo-gray-600">
                              {supplier.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-neo-gray-400" />
                            <p className="text-sm font-montserrat text-neo-gray-600">
                              {supplier.country || 'Perú'}
                            </p>
                          </div>
                          {supplier.contractedService && (
                            <div className="flex items-start space-x-2">
                              <Building2 className="w-4 h-4 text-neo-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs font-montserrat text-neo-gray-500 line-clamp-2 max-w-32">
                                {supplier.contractedService}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {getStatusBadge(supplier.status)}
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-sm font-montserrat text-neo-gray-600">
                          {supplier.createdAt.toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Supplier Modal */}
      <Modal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        title="Registrar Proveedor Manualmente"
        size="medium"
      >
        <QuickAddSupplierForm 
          onSubmit={(data) => {
            addSupplier({
              ...data,
              status: 'pending_configuration'
            });
            setShowQuickAddModal(false);
            alert(`Se ha enviado un correo a ${data.email} con las credenciales de acceso y copia a alisson.trauco@neo.com.pe`);
          }}
          onCancel={() => setShowQuickAddModal(false)}
        />
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Registrar Nuevo Proveedor Completo"
        size="large"
      >
        <AddSupplierForm 
          onSubmit={(data) => {
            addSupplier(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Supplier Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles del Proveedor"
        size="large"
      >
        {selectedSupplier && (
          <SupplierDetailView
            supplier={selectedSupplier}
            onApprove={() => handleApprove(selectedSupplier.id)}
            onDisable={() => handleDisable(selectedSupplier.id)}
            onResetPassword={() => handleResetPassword(selectedSupplier.id)}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Quick Add Supplier Form Component
const QuickAddSupplierForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generar RUC único para registro rápido
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const tempPassword = Math.random().toString(36).slice(-8);
    
    onSubmit({
      ...formData,
      ruc: `PENDIENTE-${uniqueId}`,
      address: 'Por completar',
      phone: 'Por completar',
      contactPerson: 'Por completar',
      contactPhone: 'Por completar',
      contactEmail: formData.email,
      bankAccounts: [],
      tempPassword
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-montserrat font-medium text-blue-800 mb-1">
              Registro Rápido de Proveedor
            </h4>
            <p className="text-sm text-blue-700 font-montserrat">
              Al completar este formulario, se enviará automáticamente un correo al proveedor 
              con sus credenciales de acceso y las instrucciones para completar su información.
            </p>
          </div>
        </div>
      </div>

      <Input
        label="Nombre del Proveedor"
        placeholder="Razón social o nombre completo"
        value={formData.businessName}
        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
        required
      />

      <Input
        label="Correo Electrónico"
        type="email"
        placeholder="correo@proveedor.com"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
        helper="Se enviará un correo con las credenciales de acceso a esta dirección"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          className="px-4 py-2 bg-neo-gray-100 text-neo-primary rounded-lg hover:bg-neo-gray-200 transition-colors duration-200"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-neo-primary text-white rounded-lg hover:bg-neo-primary-dark transition-colors duration-200 flex items-center space-x-2"
        >
          <Mail className="w-4 h-4" />
          <span>Registrar y Enviar Credenciales</span>
        </button>
      </div>
    </form>
  );
};

// Enhanced Add Supplier Form Component
const AddSupplierForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    ruc: '',
    businessName: '',
    tradeName: '',
    personType: 'juridica' as 'natural' | 'juridica',
    country: 'Perú',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    contractedService: '',
    bankAccounts: [{
      bankName: '',
      accountNumber: '',
      accountType: 'corriente' as 'corriente' | 'ahorros',
      currency: 'PEN' as 'PEN' | 'USD',
      cci: ''
    }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-pt-serif font-bold text-neo-primary mb-4">
          Información de la Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="RUC *"
            value={formData.ruc}
            onChange={(e) => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
            required
          />
          <Input
            label="Razón Social *"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            required
          />
          <Input
            label="Nombre Comercial"
            value={formData.tradeName}
            onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value }))}
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          className="px-4 py-2 bg-neo-gray-100 text-neo-primary rounded-lg hover:bg-neo-gray-200 transition-colors duration-200"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-neo-primary text-white rounded-lg hover:bg-neo-primary-dark transition-colors duration-200"
        >
          Registrar Proveedor
        </button>
      </div>
    </form>
  );
};

// Supplier Detail View Component
const SupplierDetailView: React.FC<{
  supplier: any;
  onApprove: () => void;
  onDisable: () => void;
  onResetPassword: () => void;
  onClose: () => void;
}> = ({ supplier, onApprove, onDisable, onResetPassword, onClose }) => {
  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="bg-neo-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-pt-serif font-bold text-neo-primary mb-2">
              {supplier.businessName}
            </h3>
            {supplier.tradeName && (
              <p className="text-neo-gray-600 font-montserrat">
                Nombre comercial: {supplier.tradeName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {supplier.status === 'approved' && <Badge variant="success">Aprobado</Badge>}
            {supplier.status === 'pending' && <Badge variant="warning">Pendiente</Badge>}
            {supplier.status === 'rejected' && <Badge variant="danger">Rechazado</Badge>}
            {supplier.status === 'disabled' && <Badge variant="danger">Deshabilitado</Badge>}
            {supplier.status === 'pending_configuration' && <Badge variant="info">Pendiente Configuración</Badge>}
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
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
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Tipo de Persona</label>
              <p className="font-montserrat text-neo-primary capitalize">
                {supplier.personType || 'Jurídica'}
              </p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">País</label>
              <p className="font-montserrat text-neo-primary">{supplier.country || 'Perú'}</p>
            </div>
          </div>
        </div>

        {/* Document Type */}
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Tipo de Comprobante a Emitir
          </h4>
          <div className="bg-white border border-neo-gray-200 rounded-lg p-4">
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Tipo de Comprobante *</label>
              <p className="font-montserrat text-neo-primary capitalize">
                {supplier.documentType === 'factura' ? 'Factura' : 
                 supplier.documentType === 'rhe' ? 'Recibo por Honorarios' : 
                 supplier.documentType || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* RUC File */}
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Ficha RUC
          </h4>
          <div className="bg-white border border-neo-gray-200 rounded-lg p-4">
            {supplier.rucFileUrl ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-neo-success" />
                  <div>
                    <p className="font-montserrat font-medium text-green-800">
                      Ficha RUC adjuntada
                    </p>
                    <p className="text-sm text-green-600 font-montserrat">
                      Archivo PDF disponible
                    </p>
                  </div>
                </div>
                <Button size="small" variant="secondary">
                  <Download className="w-4 h-4 mr-1" />
                  Descargar
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-neo-warning" />
                <div>
                  <p className="font-montserrat font-medium text-yellow-800">
                    Ficha RUC pendiente
                  </p>
                  <p className="text-sm text-yellow-600 font-montserrat">
                    El proveedor aún no ha adjuntado su ficha RUC
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Información de Contacto
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Email Empresa</label>
              <p className="font-montserrat text-neo-primary">{supplier.email}</p>
            </div>
            <div>
              <label className="text-sm font-montserrat font-medium text-neo-gray-500">Teléfono Empresa</label>
              <p className="font-montserrat text-neo-primary">{supplier.phone}</p>
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

      {/* Address */}
      <div>
        <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Dirección
        </h4>
        <p className="font-montserrat text-neo-gray-700">{supplier.address}</p>
      </div>

      {/* Banking Information */}
      {supplier.bankAccounts && supplier.bankAccounts.length > 0 && (
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Información Bancaria
          </h4>
          <div className="space-y-6">
            {/* Cuenta Bancaria 1 - SOLES */}
            <div className="bg-white border border-neo-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-neo-success" />
                <h5 className="font-montserrat font-semibold text-neo-primary">
                  🏦 Cuenta Bancaria 1 – SOLES
                </h5>
              </div>
              {(() => {
                const solesAccount = supplier.bankAccounts.find((acc: any) => acc.currency === 'PEN') || supplier.bankAccounts[0];
                return solesAccount ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Banco</label>
                      <p className="font-montserrat text-neo-primary">{solesAccount.bankName || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Tipo de Cuenta</label>
                      <p className="font-montserrat text-neo-primary capitalize">{solesAccount.accountType || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Número de Cuenta</label>
                      <p className="font-montserrat text-neo-primary">{solesAccount.accountNumber || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Código CCI</label>
                      <p className="font-montserrat text-neo-primary">{solesAccount.cci || 'No especificado'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-5 h-5 text-neo-warning" />
                    <p className="text-sm font-montserrat text-yellow-800">
                      Información de cuenta en soles pendiente
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Cuenta Bancaria 2 - DÓLARES */}
            <div className="bg-white border border-neo-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-neo-info" />
                <h5 className="font-montserrat font-semibold text-neo-primary">
                  🏦 Cuenta Bancaria 2 – DÓLARES
                </h5>
              </div>
              {(() => {
                const dollarAccount = supplier.bankAccounts.find((acc: any) => acc.currency === 'USD') || supplier.bankAccounts[1];
                return dollarAccount ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Banco</label>
                      <p className="font-montserrat text-neo-primary">{dollarAccount.bankName || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Tipo de Cuenta</label>
                      <p className="font-montserrat text-neo-primary capitalize">{dollarAccount.accountType || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Número de Cuenta</label>
                      <p className="font-montserrat text-neo-primary">{dollarAccount.accountNumber || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-montserrat font-medium text-neo-gray-500">Código CCI</label>
                      <p className="font-montserrat text-neo-primary">{dollarAccount.cci || 'No especificado'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-5 h-5 text-neo-warning" />
                    <p className="text-sm font-montserrat text-yellow-800">
                      Información de cuenta en dólares pendiente
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Show message if no bank accounts */}
      {(!supplier.bankAccounts || supplier.bankAccounts.length === 0) && (
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Información Bancaria
          </h4>
          <div className="space-y-4">
            {/* Cuenta Bancaria 1 - SOLES */}
            <div className="bg-white border border-neo-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-neo-success" />
                <h5 className="font-montserrat font-semibold text-neo-primary">
                  🏦 Cuenta Bancaria 1 – SOLES
                </h5>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-neo-warning" />
                <p className="text-sm font-montserrat text-yellow-800">
                  Información de cuenta en soles pendiente
                </p>
              </div>
            </div>

            {/* Cuenta Bancaria 2 - DÓLARES */}
            <div className="bg-white border border-neo-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-neo-info" />
                <h5 className="font-montserrat font-semibold text-neo-primary">
                  🏦 Cuenta Bancaria 2 – DÓLARES
                </h5>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-neo-warning" />
                <p className="text-sm font-montserrat text-yellow-800">
                  Información de cuenta en dólares pendiente
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Registration Information */}
      <div className="bg-neo-gray-50 rounded-lg p-4">
        <h4 className="font-montserrat font-semibold text-neo-primary mb-3">
          Información de Registro
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-montserrat font-medium text-neo-gray-500">Fecha de Registro</label>
            <p className="font-montserrat text-neo-gray-700">{supplier.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <label className="font-montserrat font-medium text-neo-gray-500">Última Actualización</label>
            <p className="font-montserrat text-neo-gray-700">{supplier.updatedAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-neo-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        
        <div className="flex space-x-3">
          <Button 
            variant="ghost" 
            onClick={onResetPassword}
            className="flex items-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Restablecer Contraseña</span>
          </Button>
          
          {supplier.status !== 'approved' && (
            <Button 
              variant="success" 
              onClick={onApprove}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Aprobar Proveedor</span>
            </Button>
          )}
          
          {supplier.status !== 'disabled' && (
            <Button 
              variant="danger" 
              onClick={onDisable}
              className="flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Deshabilitar Proveedor</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};