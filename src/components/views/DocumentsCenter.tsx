import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Upload, FileText, Eye, Plus } from 'lucide-react';
import { useSupabaseStorage } from '../../lib/storage';

export const DocumentsCenter: React.FC = () => {
  const { companyDocuments, addCompanyDocument, loading } = useApp();
  const { user } = useAuth();
  const { uploadFile } = useSupabaseStorage();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canUpload = user?.role === 'operaciones';

  const documentCategories = [
    { value: 'all', label: 'Todos los Documentos' },
    { value: 'contrato', label: 'Contratos' },
    { value: 'orden_compra', label: 'Órdenes de Compra' },
    { value: 'acuerdo_confidencialidad', label: 'Acuerdos de Confidencialidad' },
    { value: 'manual_guia', label: 'Manuales y Guías' },
    { value: 'otro', label: 'Otros' }
  ];

  const mockDocuments = [
    {
      id: '1',
      name: 'Manual del Proveedor NEO Consulting',
      type: 'manual',
      fileUrl: '#',
      uploadedBy: 'Sistema NEO',
      uploadedAt: new Date('2024-11-01'),
      description: 'Guía completa para proveedores sobre procesos y procedimientos'
    },
    {
      id: '2',
      name: 'Acuerdo de Confidencialidad - Plantilla',
      type: 'nda',
      fileUrl: '#',
      uploadedBy: 'Equipo Legal',
      uploadedAt: new Date('2024-11-15'),
      description: 'Plantilla estándar de NDA para proveedores'
    },
    {
      id: '3',
      name: 'Contrato Marco de Servicios',
      type: 'contract',
      fileUrl: '#',
      supplierId: '1',
      uploadedBy: 'María González',
      uploadedAt: new Date('2024-12-01'),
      description: 'Contrato específico para servicios de consultoría'
    }
  ];

  const allDocuments = [...companyDocuments, ...mockDocuments];
  
  const filteredDocuments = selectedCategory === 'all' 
    ? allDocuments 
    : allDocuments.filter(doc => doc.type === selectedCategory);

  const getDocumentIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-neo-accent" />;
  };

  const getDocumentTypeBadge = (type: string) => {
    const typeLabels = {
      contrato: 'Contrato',
      orden_compra: 'Orden de Compra',
      acuerdo_confidencialidad: 'NDA',
      manual_guia: 'Manual',
      otro: 'Otro'
    };
    
    return <Badge variant="info">{typeLabels[type as keyof typeof typeLabels]}</Badge>;
  };

  const handleUpload = async (formData: any) => {
    try {
      setUploadError(null);
      
      console.log('📤 Subiendo documento de empresa...');
      
      // 1. Subir archivo a Storage
      let fileUrl = '#';
      if (formData.file) {
        const userRole = user?.role === 'operaciones' ? 'operaciones' : 'aprobador';
        const uploadResult = await uploadFile(
          formData.file,
          userRole,
          `documentos_empresa/${formData.type}`
        );
        
        if (uploadResult.success && uploadResult.url) {
          fileUrl = uploadResult.url;
          console.log('✅ Documento subido a Storage:', uploadResult.url);
        } else {
          throw new Error(`Error subiendo archivo: ${uploadResult.error}`);
        }
      }

      // 2. Crear registro en base de datos con URL real
      const result = await addCompanyDocument({
        name: formData.name,
        type: formData.type,
        file: formData.file,
        fileUrl: fileUrl,
        uploadedBy: user?.name || 'Usuario',
        description: formData.description
      });
      
      if (result) {
        setShowUploadModal(false);
        setUploadError(null);
        console.log('✅ Documento subido exitosamente');
      } else {
        setUploadError('No se pudo subir el documento. Verifique sus permisos.');
      }
    } catch (error) {
      console.error('❌ Error subiendo documento:', error);
      setUploadError('Error inesperado. Intente nuevamente.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
            Centro de Documentación
          </h1>
          <p className="text-neo-gray-600 font-montserrat">
            Acceda a contratos, manuales y documentación importante
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Subir Documento
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {documentCategories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-lg font-montserrat text-sm transition-colors ${
              selectedCategory === category.value
                ? 'bg-neo-accent text-white'
                : 'bg-white text-neo-gray-600 hover:bg-neo-gray-50 border border-neo-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neo-gray-400" />
            </div>
            <p className="text-neo-gray-500 font-montserrat">
              No hay documentos en esta categoría
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} hover className="group">
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-montserrat font-semibold text-neo-primary group-hover:text-neo-accent transition-colors">
                        {doc.name}
                      </h3>
                      {getDocumentTypeBadge(doc.type)}
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-neo-gray-600 font-montserrat mb-3 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-neo-gray-400 font-montserrat mb-4">
                      <p>Subido por: {doc.uploadedBy}</p>
                      <p>Fecha: {doc.uploadedAt.toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="small" variant="secondary">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="small" variant="ghost">
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Subir Documento"
        size="medium"
      >
        <UploadDocumentForm 
          onSubmit={handleUpload} 
          onCancel={() => setShowUploadModal(false)}
          isUploading={loading.companyDocuments}
          error={uploadError}
        />
      </Modal>
    </div>
  );
};

// Upload Form Component
const UploadDocumentForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isUploading?: boolean;
  error?: string | null;
}> = ({ onSubmit, onCancel, isUploading = false, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    supplierId: '',
    file: null as File | null
  });

  const documentTypes = [
    { value: 'contrato', label: 'Contrato' },
    { value: 'orden_compra', label: 'Orden de Compra' },
    { value: 'acuerdo_confidencialidad', label: 'Acuerdo de Confidencialidad' },
    { value: 'manual_guia', label: 'Manual o Guía' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
          Nombre del Documento *
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-sm font-montserrat">
              Error: {error}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
          Tipo de Documento *
        </label>
        <select
          className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          required
        >
          <option value="">Seleccionar tipo...</option>
          {documentTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
          Descripción
        </label>
        <textarea
          className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent resize-none"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
          Archivo *
        </label>
        <div className="border-2 border-dashed border-neo-gray-300 rounded-lg p-4 text-center">
          <Upload className="w-8 h-8 text-neo-gray-400 mx-auto mb-2" />
          <div className="space-y-2">
            <label className="inline-block">
              <span className="text-neo-accent font-montserrat font-medium cursor-pointer hover:underline">
                Seleccionar archivo
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </label>
            <p className="text-xs text-neo-gray-400 font-montserrat">
              PDF, DOC, DOCX - Máximo 10MB
            </p>
          </div>
          {formData.file && (
            <div className="mt-2 p-2 bg-neo-gray-50 rounded">
              <span className="text-sm font-montserrat text-neo-gray-700">
                {formData.file.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isUploading} disabled={isUploading}>
          {isUploading ? 'Subiendo...' : 'Subir Documento'}
        </Button>
      </div>
    </form>
  );
};