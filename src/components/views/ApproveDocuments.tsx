import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, XCircle, Eye, FileText, AlertCircle, Download, Paperclip, Search, Filter, ExternalLink, ZoomIn } from 'lucide-react';

export const ApproveDocuments: React.FC = () => {
  const { getFilteredDocuments, suppliers, approveDocument, rejectDocument, stats, fetchApproverInbox, documents: allDocuments } = useApp();
  const { user } = useAuth();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  // Estados para los filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [documentNumberSearch, setDocumentNumberSearch] = useState('');

  // ✅ CORREGIR: Usar todos los documentos y filtrar por pendientes
  const allAvailableDocuments = [
    ...(stats?.documents || []),
    ...getFilteredDocuments(),
    ...allDocuments
  ];
  
  // Filtrar solo documentos pendientes para aprobación
  const documents = allAvailableDocuments.filter(doc => 
    doc.status === 'pending' || doc.status === 'pendiente'
  );

  // ✅ CARGAR INBOX DEL APROBADOR
  useEffect(() => {
    if (user?.email) {
      fetchApproverInbox(user.email);
    }
  }, [user, fetchApproverInbox]);

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.businessName || 'Proveedor no encontrado';
  };

  // Función para filtrar documentos
  const applyFilters = () => {
    return documents.filter(doc => {
      // Filtro por estado
      const matchesStatus = statusFilter === 'all' || 
        doc.status === statusFilter || 
        (statusFilter === 'pending' && (doc.status === 'pending' || doc.status === 'pendiente'));
      
      // Filtro por proveedor
      const supplierName = getSupplierName(doc.supplierId).toLowerCase();
      const matchesSupplier = supplierName.includes(supplierSearch.toLowerCase());
      
      // Filtro por número de documento
      const matchesDocumentNumber = doc.number.toLowerCase().includes(documentNumberSearch.toLowerCase());
      
      return matchesStatus && matchesSupplier && matchesDocumentNumber;
    });
  };

  const filteredDocuments = applyFilters();
  const pendingDocuments = filteredDocuments.filter(doc => doc.status === 'pending');

  const handleApprove = (doc: any) => {
    setSelectedDocument(doc);
    setShowApprovalModal(true);
  };

  const handleReject = (doc: any) => {
    setSelectedDocument(doc);
    setShowRejectionModal(true);
  };

  const handleViewInvoice = (doc: any) => {
    setSelectedDocument(doc);
    setShowInvoiceModal(true);
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          Aprobar Comprobantes
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Revisa y aprueba los comprobantes pendientes de validación
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent>
          <div className="space-y-6">
            {/* Filtro 1: Botones de Estado */}
            <div>
              <h4 className="text-sm font-montserrat font-semibold text-neo-primary mb-3 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                🎯 Documentos para Validación (Solo Pendientes)
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-neo-info" />
                  <div>
                    <h4 className="font-montserrat font-semibold text-blue-800">
                      Vista de Validador - Solo Documentos Pendientes
                    </h4>
                    <p className="text-sm text-blue-700 font-montserrat">
                      Como validador, solo ves documentos que requieren tu aprobación ({documents.length} pendientes)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros 2 y 3: Buscadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtro 2: Buscador por Proveedor */}
              <div>
                <h4 className="text-sm font-montserrat font-semibold text-neo-primary mb-3 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar por Proveedor
                </h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neo-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Nombre del proveedor..."
                    className="w-full pl-10 pr-4 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro 3: Buscador por Número de Factura */}
              <div>
                <h4 className="text-sm font-montserrat font-semibold text-neo-primary mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Buscar por Número de Comprobante
                </h4>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neo-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Ej: F001-00123, B001-00456..."
                    className="w-full pl-10 pr-4 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent"
                    value={documentNumberSearch}
                    onChange={(e) => setDocumentNumberSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Información de resultados */}
            <div className="flex items-center justify-between pt-4 border-t border-neo-gray-200">
              <div className="flex items-center space-x-4 text-sm font-montserrat text-neo-gray-600">
                <span>
                  Mostrando <strong>{filteredDocuments.length}</strong> de <strong>{documents.length}</strong> comprobantes
                </span>
                {(supplierSearch || documentNumberSearch || statusFilter !== 'pending') && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setStatusFilter('pending');
                      setSupplierSearch('');
                      setDocumentNumberSearch('');
                    }}
                    className="text-neo-accent hover:text-neo-primary"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Count */}
      {statusFilter === 'pending' && pendingDocuments.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-neo-warning" />
              </div>
              <div>
                <h3 className="text-lg font-pt-serif font-bold text-neo-primary">
                  {pendingDocuments.length} comprobante{pendingDocuments.length !== 1 ? 's' : ''} pendiente{pendingDocuments.length !== 1 ? 's' : ''} de aprobación
                </h3>
                <p className="text-neo-gray-600 font-montserrat">
                  Revisa los documentos a continuación para aprobar o rechazar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-6">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent padding="large">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-neo-gray-400" />
                </div>
                <h3 className="text-lg font-pt-serif font-semibold text-neo-primary mb-2">
                  {statusFilter === 'pending' ? '¡Todo al día!' : 'No se encontraron comprobantes'}
                </h3>
                <p className="text-neo-gray-500 font-montserrat">
                  {statusFilter === 'pending' 
                    ? 'No hay comprobantes pendientes de aprobación'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className={`border-l-4 ${
              (!doc.deliverablesFiles || doc.deliverablesFiles.length === 0) 
                ? 'border-l-red-500 bg-red-50' 
                : doc.status === 'pending' 
                ? 'border-l-neo-warning' 
                : 'border-l-neo-success'
            }`}>
              <CardContent>
                {/* 🔄 ALERTA PARA COMPROBANTES SIN ENTREGABLES */}
                {(!doc.deliverablesFiles || doc.deliverablesFiles.length === 0) && (
                  <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-700" />
                      <div>
                        <p className="text-sm font-montserrat text-red-800 font-bold">
                          ⚠️ COMPROBANTE INCOMPLETO
                        </p>
                        <p className="text-xs font-montserrat text-red-700">
                          Este comprobante no tiene archivos de entregables. No se puede aprobar hasta que se corrija.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <FileText className="w-6 h-6 text-neo-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-pt-serif font-bold text-neo-primary">
                          {doc.type.toUpperCase()} {doc.number}
                        </h3>
                        {/* 🔄 BADGES MEJORADOS CON VALIDACIÓN */}
                        {doc.status === 'pending' && (
                          <>
                            <Badge variant="warning">Pendiente</Badge>
                            {(!doc.deliverablesFiles || doc.deliverablesFiles.length === 0) && (
                              <Badge variant="danger">❌ Sin Entregables</Badge>
                            )}
                          </>
                        )}
                        {doc.status === 'approved' && <Badge variant="success">Aprobado</Badge>}
                        {doc.status === 'rejected' && <Badge variant="danger">Rechazado</Badge>}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Proveedor
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {getSupplierName(doc.supplierId)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Monto
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="font-montserrat text-neo-primary font-semibold">
                              {doc.currency} {doc.amount.toLocaleString()}
                            </p>
                            {/* ✅ DESCARGA DE FACTURA - SIEMPRE VISIBLE */}
                            <Button 
                              size="small" 
                              variant="ghost"
                              className="p-1 hover:bg-blue-100"
                            >
                              <Download className="w-3 h-3 text-neo-accent" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Aprobador
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {doc.approverEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500">
                            Fecha
                          </p>
                          <p className="font-montserrat text-neo-primary">
                            {doc.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* 🔄 NUEVA SECCIÓN DE ENTREGABLES MEJORADA */}
                      {doc.deliverablesFiles && doc.deliverablesFiles.length > 0 ? (
                        <div className="mb-4">
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500 mb-1">
                            Entregables
                          </p>
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-neo-success" />
                            <p className="text-sm font-montserrat text-neo-success font-medium">
                              ✅ {doc.deliverablesFiles.length} archivo(s) de entregables disponibles
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {doc.deliverablesFiles.map((file: any) => (
                              <div key={file.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-3 h-3 text-neo-success" />
                                  <span className="text-xs font-montserrat text-neo-gray-700">
                                    {file.name} ({formatFileSize(file.size)})
                                  </span>
                                </div>
                                <Button size="small" variant="ghost" className="p-1">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-sm font-montserrat font-medium text-red-600">
                              ❌ Sin Archivos de Entregables
                            </p>
                          </div>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-montserrat text-red-700">
                              Este comprobante no tiene archivos de entregables adjuntos. 
                              <strong> No se puede aprobar hasta que se corrija.</strong>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Service Performed Section */}
                      {doc.servicePerformed && (
                        <div className="mb-4">
                          <p className="text-sm font-montserrat font-medium text-neo-gray-500 mb-2">
                            Servicio Realizado
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-montserrat text-neo-gray-700 leading-relaxed">
                              {doc.servicePerformed.length > 200 
                                ? `${doc.servicePerformed.substring(0, 200)}...` 
                                : doc.servicePerformed
                              }
                            </p>
                            {doc.servicePerformed.length > 200 && (
                              <button
                                onClick={() => handleViewInvoice(doc)}
                                className="text-neo-accent hover:text-neo-primary text-sm font-montserrat mt-2 hover:underline"
                              >
                                Ver descripción completa
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Detraction Information */}
                      {doc.hasDetraction && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-montserrat font-medium text-neo-primary mb-2">
                            Información de Detracción
                          </h4>
                          <div className="grid grid-cols-3 gap-4 text-sm font-montserrat">
                            <div>
                              <span className="text-neo-gray-500">Porcentaje:</span>
                              <p className="font-medium">{doc.detractionPercentage}%</p>
                            </div>
                            <div>
                              <span className="text-neo-gray-500">Monto:</span>
                              <p className="font-medium">{doc.currency} {doc.detractionAmount?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-neo-gray-500">Código SUNAT:</span>
                              <p className="font-medium">{doc.detractionCode}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button 
                      size="small" 
                      variant="secondary"
                      onClick={() => handleViewInvoice(doc)}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalle</span>
                    </Button>

                    {/* ✅ BOTONES SIEMPRE VISIBLES PARA TODOS LOS COMPROBANTES PENDIENTES */}
                    <Button 
                      size="small" 
                      variant="success"
                      onClick={() => handleApprove(doc)}
                      className="flex items-center space-x-2"
                      disabled={!doc.deliverablesFiles || doc.deliverablesFiles.length === 0}
                      title={(!doc.deliverablesFiles || doc.deliverablesFiles.length === 0) ? "No se puede aprobar sin entregables" : "Aprobar comprobante"}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Aprobar</span>
                    </Button>
                    <Button 
                      size="small" 
                      variant="danger"
                      onClick={() => handleReject(doc)}
                      className="flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      <span>Rechazar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Viewer Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Visualizar Comprobante"
        size="xlarge"
      >
        {selectedDocument && (
          <InvoiceViewer
            document={selectedDocument}
            supplierName={getSupplierName(selectedDocument.supplierId)}
            onClose={() => setShowInvoiceModal(false)}
            onApprove={() => {
              setShowInvoiceModal(false);
              handleApprove(selectedDocument);
            }}
            onReject={() => {
              setShowInvoiceModal(false);
              handleReject(selectedDocument);
            }}
          />
        )}
      </Modal>
      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Aprobar Comprobante"
        size="medium"
      >
        {selectedDocument && (
          <ApprovalForm
            document={selectedDocument}
            onApprove={(code, budget) => {
              approveDocument(selectedDocument.id, code, budget);
              setShowApprovalModal(false);
            }}
            onCancel={() => setShowApprovalModal(false)}
          />
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Rechazar Comprobante"
        size="medium"
      >
        {selectedDocument && (
          <RejectionForm
            document={selectedDocument}
            onReject={(reason) => {
              rejectDocument(selectedDocument.id, reason);
              setShowRejectionModal(false);
            }}
            onCancel={() => setShowRejectionModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Invoice Viewer Component
const InvoiceViewer: React.FC<{
  document: any;
  supplierName: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ document, supplierName, onClose, onApprove, onReject }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="bg-gradient-to-r from-neo-primary to-neo-accent text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-pt-serif font-bold">
                {document.type.toUpperCase()} {document.number}
              </h3>
              <p className="text-blue-100 font-montserrat">
                {supplierName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-pt-serif font-bold">
              {document.currency} {document.amount.toLocaleString()}
            </p>
            <div className="mt-2">
              {document.status === 'pending' && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-montserrat">
                  Pendiente Aprobación
                </span>
              )}
              {document.status === 'approved' && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-montserrat">
                  Aprobado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-200 font-montserrat">Fecha Registro</p>
            <p className="font-montserrat font-medium">
              {document.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-blue-200 font-montserrat">Aprobador</p>
            <p className="font-montserrat font-medium">
              {document.approverEmail}
            </p>
          </div>
          <div>
            <p className="text-blue-200 font-montserrat">Estado Pago</p>
            <p className="font-montserrat font-medium capitalize">
              {document.paymentStatus === 'paid' ? 'Pagado' : 
               document.paymentStatus === 'scheduled' ? 'Programado' : 'Pendiente'}
            </p>
          </div>
          {document.hasDetraction && (
            <div>
              <p className="text-blue-200 font-montserrat">Detracción</p>
              <p className="font-montserrat font-medium">
                {document.detractionPercentage}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Section */}
      <div className="bg-neo-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-neo-accent" />
            <div>
              <h4 className="text-lg font-pt-serif font-bold text-neo-primary">
                📄 Comprobante PDF
              </h4>
              <p className="text-sm text-neo-gray-600 font-montserrat">
                Archivo subido por el proveedor
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              {isFullscreen ? 'Minimizar' : 'Pantalla Completa'}
            </Button>
            <Button size="small" variant="ghost">
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </Button>
            <Button size="small" variant="ghost">
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir en Nueva Pestaña
            </Button>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className={`bg-white rounded-lg border-2 border-neo-gray-200 ${
          isFullscreen ? 'h-96' : 'h-64'
        } transition-all duration-300`}>
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            {/* Simulated PDF Viewer */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h5 className="font-montserrat font-semibold text-neo-primary mb-2">
                  Vista Previa del PDF
                </h5>
                <p className="text-sm text-neo-gray-600 font-montserrat mb-4">
                  {document.type.toUpperCase()} {document.number}
                </p>
                <div className="bg-white border border-neo-gray-300 rounded-lg p-4 max-w-md mx-auto">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-sm font-montserrat text-neo-gray-600">Documento:</span>
                      <span className="text-sm font-montserrat font-medium">{document.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-montserrat text-neo-gray-600">Monto:</span>
                      <span className="text-sm font-montserrat font-medium">{document.currency} {document.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-montserrat text-neo-gray-600">Proveedor:</span>
                      <span className="text-sm font-montserrat font-medium">{supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-montserrat text-neo-gray-600">Fecha:</span>
                      <span className="text-sm font-montserrat font-medium">{document.createdAt.toLocaleDateString()}</span>
                    </div>
                    {document.hasDetraction && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-montserrat text-neo-gray-600">Detracción:</span>
                        <span className="text-sm font-montserrat font-medium">{document.detractionPercentage}% - {document.currency} {document.detractionAmount?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-neo-gray-500 font-montserrat mt-4">
                  En una implementación real, aquí se mostraría el PDF usando un visor como PDF.js
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Performed Section */}
      {document.servicePerformed && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-neo-accent rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-pt-serif font-bold text-neo-primary">
                📋 Servicio Realizado
              </h4>
              <p className="text-sm text-neo-gray-600 font-montserrat">
                Descripción detallada del servicio prestado
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-neo-gray-700 font-montserrat leading-relaxed text-base">
              {document.servicePerformed}
            </p>
          </div>
        </div>
      )}

      {/* Deliverables Files */}
      {document.deliverablesFiles && document.deliverablesFiles.length > 0 && (
        <div>
          <h4 className="font-montserrat font-semibold text-neo-primary mb-3 border-b border-neo-gray-200 pb-2">
            📎 Archivos de Entregables ({document.deliverablesFiles.length})
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

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-neo-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cerrar Visualizador
        </Button>
        
        {document.status === 'pending' && (
          <div className="flex space-x-3">
            <Button variant="danger" onClick={onReject}>
              <XCircle className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
            <Button variant="success" onClick={onApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprobar
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
// Approval Form Component
const ApprovalForm: React.FC<{
  document: any;
  onApprove: (code: string, budget: string) => void;
  onCancel: () => void;
}> = ({ document, onApprove, onCancel }) => {
  const [code, setCode] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(code, budget);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neo-gray-50 rounded-lg p-4">
        <h4 className="font-montserrat font-semibold text-neo-primary mb-2">
          {document.type.toUpperCase()} {document.number}
        </h4>
        <p className="text-sm text-neo-gray-600 font-montserrat">
          Monto: {document.currency} {document.amount.toLocaleString()}
        </p>
        {document.deliverables && (
          <p className="text-sm text-neo-gray-600 font-montserrat mt-1">
            Entregables: {document.deliverables}
          </p>
        )}
        {document.deliverablesFiles && document.deliverablesFiles.length > 0 && (
          <p className="text-sm text-neo-gray-600 font-montserrat mt-1">
            Archivos adjuntos: {document.deliverablesFiles.length} archivo(s)
          </p>
        )}
      </div>

      <Input
        label="Código de Comprobante"
        placeholder="Ej: COD-2024-001"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        helper="Código interno para identificar el comprobante"
      />

      <Input
        label="Presupuesto/Proyecto"
        placeholder="Ej: PROY-SISTEMAS-2024"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        required
        helper="Presupuesto o proyecto al que se imputa el gasto"
      />

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-neo-success flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-montserrat font-medium text-green-800 mb-1">
              Al aprobar este comprobante:
            </h4>
            <ul className="text-sm text-green-700 font-montserrat space-y-1">
              <li>• Se programará el pago para 15 días después de la aprobación</li>
              <li>• Se notificará al proveedor sobre la aprobación</li>
              <li>• El comprobante quedará disponible para pago</li>
              {document.deliverablesFiles && document.deliverablesFiles.length > 0 && (
                <li>• Los archivos de entregables quedarán disponibles para descarga</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="success">
          <CheckCircle className="w-4 h-4 mr-2" />
          Aprobar Comprobante
        </Button>
      </div>
    </form>
  );
};

// Rejection Form Component
const RejectionForm: React.FC<{
  document: any;
  onReject: (reason: string) => void;
  onCancel: () => void;
}> = ({ document, onReject, onCancel }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(reason);
  };

  const commonReasons = [
    'Información incompleta en el comprobante',
    'Monto no coincide con lo acordado',
    'Falta documentación de soporte',
    'Comprobante no cumple con requisitos fiscales',
    'Entregables no corresponden a lo facturado',
    'Archivos de entregables incompletos o incorrectos',
    'Información de detracción incorrecta'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neo-gray-50 rounded-lg p-4">
        <h4 className="font-montserrat font-semibold text-neo-primary mb-2">
          {document.type.toUpperCase()} {document.number}
        </h4>
        <p className="text-sm text-neo-gray-600 font-montserrat">
          Monto: {document.currency} {document.amount.toLocaleString()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
          Motivo del Rechazo *
        </label>
        <div className="space-y-2 mb-4">
          {commonReasons.map((commonReason, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setReason(commonReason)}
              className="w-full text-left p-3 border border-neo-gray-200 rounded-lg hover:bg-neo-gray-50 text-sm font-montserrat transition-colors"
            >
              {commonReason}
            </button>
          ))}
        </div>
        
        <textarea
          className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent resize-none"
          rows={4}
          placeholder="Especifique el motivo del rechazo..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <p className="text-xs text-neo-gray-500 font-montserrat mt-1">
          Sea específico para ayudar al proveedor a corregir el comprobante
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-montserrat font-medium text-red-800 mb-1">
              Al rechazar este comprobante:
            </h4>
            <ul className="text-sm text-red-700 font-montserrat space-y-1">
              <li>• Se notificará al proveedor sobre el rechazo</li>
              <li>• El proveedor podrá corregir y volver a enviar</li>
              <li>• Se registrará el motivo del rechazo</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger">
          <XCircle className="w-4 h-4 mr-2" />
          Rechazar Comprobante
        </Button>
      </div>
    </form>
  );
};