import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { FileText, Search, Eye, Download, Briefcase, Calendar, User, DollarSign } from 'lucide-react';

export const AllDocuments: React.FC = () => {
  const { getFilteredDocuments, suppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // 🔄 USAR DOCUMENTOS FILTRADOS POR ROL
  const documents = getFilteredDocuments();

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.businessName || 'Proveedor no encontrado';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprobado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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

  const filteredDocuments = documents.filter(doc => {
    const supplierName = getSupplierName(doc.supplierId);
    const matchesSearch = 
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDocumentClick = (doc: any) => {
    setSelectedDocument(doc);
    setShowServiceModal(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          📋 Todos los Comprobantes - Vista Administrativa
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Como administrador, supervisa todos los comprobantes aprobados del sistema
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neo-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por número, proveedor o tipo..."
                  className="w-full pl-10 pr-4 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="px-4 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Comprobantes ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-neo-gray-400" />
              </div>
              <p className="text-neo-gray-500 font-montserrat">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron comprobantes con los filtros aplicados'
                  : 'No hay comprobantes registrados'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neo-gray-200">
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Comprobante
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Proveedor
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Pago
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 font-montserrat font-semibold text-neo-primary">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-neo-gray-100 hover:bg-neo-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-neo-accent" />
                          <div>
                            <button 
                              onClick={() => handleDocumentClick(doc)}
                              className="font-montserrat font-medium text-neo-primary hover:text-neo-accent hover:underline cursor-pointer text-left transition-colors"
                            >
                              {doc.type.toUpperCase()} {doc.number}
                            </button>
                            {doc.deliverables && (
                              <p className="text-sm text-neo-gray-600 font-montserrat">
                                {doc.deliverables}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-montserrat text-neo-gray-700">
                          {getSupplierName(doc.supplierId)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-montserrat font-medium text-neo-primary">
                            {doc.currency} {doc.amount.toLocaleString()}
                          </p>
                          {doc.hasDetraction && doc.detractionAmount && (
                            <p className="text-xs text-neo-gray-500 font-montserrat">
                              Detracción: {doc.currency} {doc.detractionAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="py-4 px-4">
                        {getPaymentStatusBadge(doc.paymentStatus)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-montserrat text-neo-gray-600">
                          {doc.createdAt.toLocaleDateString()}
                        </p>
                        {doc.approvedAt && (
                          <p className="text-xs text-neo-gray-500 font-montserrat">
                            Aprobado: {doc.approvedAt.toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button size="small" variant="secondary">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="small" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Performed Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title="Detalle del Comprobante"
        size="large"
      >
        {selectedDocument && (
          <ServicePerformedDetail
            document={selectedDocument}
            supplierName={getSupplierName(selectedDocument.supplierId)}
            onClose={() => setShowServiceModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Service Performed Detail Component
const ServicePerformedDetail: React.FC<{
  document: any;
  supplierName: string;
  onClose: () => void;
}> = ({ document, supplierName, onClose }) => {
  return (
    <div className="space-y-6">
      {/* Header with Document Info */}
      <div className="bg-neo-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-neo-accent bg-opacity-10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-neo-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-pt-serif font-bold text-neo-primary">
                {document.type.toUpperCase()} {document.number}
              </h3>
              <p className="text-neo-gray-600 font-montserrat">
                {supplierName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-pt-serif font-bold text-neo-primary">
              {document.currency} {document.amount.toLocaleString()}
            </p>
            {getStatusBadge(document.status)}
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neo-gray-400" />
            <div>
              <p className="text-xs text-neo-gray-500 font-montserrat">Fecha Registro</p>
              <p className="text-sm font-montserrat text-neo-primary">
                {document.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-neo-gray-400" />
            <div>
              <p className="text-xs text-neo-gray-500 font-montserrat">Aprobador</p>
              <p className="text-sm font-montserrat text-neo-primary">
                {document.approverEmail}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-neo-gray-400" />
            <div>
              <p className="text-xs text-neo-gray-500 font-montserrat">Estado Pago</p>
              <p className="text-sm font-montserrat text-neo-primary">
                {getPaymentStatusBadge(document.paymentStatus)}
              </p>
            </div>
          </div>
          
          {document.hasDetraction && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-neo-gray-400" />
              <div>
                <p className="text-xs text-neo-gray-500 font-montserrat">Detracción</p>
                <p className="text-sm font-montserrat text-neo-primary">
                  {document.detractionPercentage}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Performed Section - MAIN FOCUS */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-neo-accent rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-pt-serif font-bold text-neo-primary">
              Servicio Realizado
            </h4>
            <p className="text-sm text-neo-gray-600 font-montserrat">
              Descripción detallada del servicio prestado
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-neo-gray-700 font-montserrat leading-relaxed text-base">
            {document.servicePerformed || 'No se ha especificado el servicio realizado para este comprobante.'}
          </p>
        </div>
      </div>

      {/* Additional Information */}
      {document.deliverables && (
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2">
            Entregables
          </h4>
          <p className="text-neo-gray-700 font-montserrat bg-neo-gray-50 p-3 rounded-lg">
            {document.deliverables}
          </p>
        </div>
      )}

      {/* Deliverables Files */}
      {document.deliverablesFiles && document.deliverablesFiles.length > 0 && (
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2">
            Archivos de Entregables ({document.deliverablesFiles.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {document.deliverablesFiles.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-neo-success" />
                  <div>
                    <span className="text-sm font-montserrat text-neo-gray-700 block">
                      {file.name}
                    </span>
                    <span className="text-xs text-neo-gray-500 font-montserrat">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button size="small" variant="ghost">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detraction Information */}
      {document.hasDetraction && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3">
            Información de Detracción
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm font-montserrat">
            <div>
              <span className="text-neo-gray-500">Porcentaje:</span>
              <p className="font-medium">{document.detractionPercentage}%</p>
            </div>
            <div>
              <span className="text-neo-gray-500">Monto:</span>
              <p className="font-medium">{document.currency} {document.detractionAmount?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-neo-gray-500">Código SUNAT:</span>
              <p className="font-medium">{document.detractionCode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-neo-gray-200">
        <div className="flex space-x-3">
          <Button variant="secondary">
            <Eye className="w-4 h-4 mr-2" />
            Ver PDF
          </Button>
          <Button variant="ghost">
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>
        
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );

  function getStatusBadge(status: string) {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprobado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  function getPaymentStatusBadge(status: string) {
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
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};