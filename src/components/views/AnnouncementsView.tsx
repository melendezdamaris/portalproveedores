import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, AlertCircle, Info, CheckCircle, Plus, FileText, Download, AlertTriangle } from 'lucide-react';
import { useSupabaseStorage } from '../../lib/storage';

export const AnnouncementsView: React.FC = () => {
  const { announcements, addAnnouncement } = useApp();
  const { user } = useAuth();
  const { uploadMultipleFiles } = useSupabaseStorage();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreateAnnouncements = user?.role === 'operaciones';

  // Filter announcements based on user role and targeting
  const userAnnouncements = announcements.filter(announcement => 
    announcement.isActive && (
      announcement.targetRole === 'all' || 
      announcement.targetRole === user?.role ||
      (announcement.targetSupplier && announcement.targetSupplier === user?.id)
    )
  ).sort((a, b) => {
    // Sort by urgency first, then by date
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const getAnnouncementIcon = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return <AlertTriangle className="w-6 h-6 text-red-600" />;
    }
    
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-neo-warning" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-neo-success" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-neo-info" />;
    }
  };

  const getAnnouncementBadge = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return <Badge variant="danger">Urgente</Badge>;
    }
    
    switch (type) {
      case 'operativo':
        return <Badge variant="warning">Importante</Badge>;
      case 'financiero':
        return <Badge variant="success">Novedad</Badge>;
      case 'general':
      default:
        return <Badge variant="info">Información</Badge>;
    }
  };

  const getAnnouncementBg = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return 'bg-red-50 border-red-200 border-l-red-500';
    }
    
    switch (type) {
      case 'operativo':
        return 'bg-yellow-50 border-yellow-200 border-l-yellow-500';
      case 'financiero':
        return 'bg-green-50 border-green-200 border-l-green-500';
      case 'general':
      default:
        return 'bg-blue-50 border-blue-200 border-l-blue-500';
    }
  };

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      console.log('📤 Creando comunicado con archivos...');
      
      // 1. Subir archivos adjuntos si existen
      let attachments = [];
      if (announcementData.attachments && announcementData.attachments.length > 0) {
        const userRole = user?.role === 'operaciones' ? 'operaciones' : 'aprobador';
        const uploadResults = await uploadMultipleFiles(
          announcementData.attachments,
          userRole,
          `comunicados/${new Date().getTime()}`
        );
        
        attachments = uploadResults.map((result, index) => ({
          name: announcementData.attachments[index].name,
          url: result.success ? result.url : '#',
          type: announcementData.attachments[index].type
        }));
        
        console.log('✅ Archivos de comunicado subidos:', attachments.length);
      }

      // 2. Crear comunicado con URLs reales
      await addAnnouncement({
        ...announcementData,
        attachments
      });
      
      console.log('✅ Comunicado creado exitosamente con archivos en Storage');
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('❌ Error creando comunicado:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
            Comunicados
          </h1>
          <p className="text-neo-gray-600 font-montserrat">
            Mantente informado sobre actualizaciones y noticias importantes
          </p>
        </div>
        {canCreateAnnouncements && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Comunicado
          </Button>
        )}
      </div>

      {userAnnouncements.length === 0 ? (
        <Card>
          <CardContent padding="large">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neo-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-neo-gray-400" />
              </div>
              <h3 className="text-lg font-pt-serif font-semibold text-neo-primary mb-2">
                No hay comunicados nuevos
              </h3>
              <p className="text-neo-gray-500 font-montserrat">
                Te notificaremos cuando haya nuevas actualizaciones importantes
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {userAnnouncements.map((announcement) => (
            <Card key={announcement.id} className={`border-l-4 ${getAnnouncementBg(announcement.type, announcement.isUrgent || false)}`}>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getAnnouncementIcon(announcement.type, announcement.isUrgent || false)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-pt-serif font-bold text-neo-primary">
                          {announcement.title}
                        </h2>
                        {announcement.isUrgent && (
                          <span className="animate-pulse">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </span>
                        )}
                      </div>
                      {getAnnouncementBadge(announcement.type, announcement.isUrgent || false)}
                    </div>
                    
                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="text-neo-gray-700 font-montserrat leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>

                    {/* File Attachments */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-montserrat font-semibold text-neo-primary mb-2">
                          Archivos adjuntos:
                        </h4>
                        <div className="space-y-2">
                          {announcement.attachments.map((file, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-neo-gray-200">
                              <FileText className="w-4 h-4 text-neo-accent" />
                              <span className="text-sm font-montserrat text-neo-gray-700 flex-1">
                                {file.name}
                              </span>
                              <Button size="small" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Targeting Info */}
                    {announcement.targetSupplier && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-montserrat text-blue-800">
                          <Info className="w-4 h-4 inline mr-1" />
                          Este comunicado está dirigido específicamente a tu empresa
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-neo-gray-500 font-montserrat">
                      <span>Por: {announcement.createdBy}</span>
                      <div className="flex items-center space-x-4">
                        {announcement.scheduledDate && announcement.scheduledDate > new Date() && (
                          <span className="text-neo-warning">
                            Programado para: {announcement.scheduledDate.toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          {formatDistanceToNow(announcement.createdAt, { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Comunicado"
        size="large"
      >
        <CreateAnnouncementForm
          onSubmit={handleCreateAnnouncement}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-neo-primary to-neo-accent text-white">
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-pt-serif font-bold mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="font-montserrat mb-4">
                Si tienes dudas sobre algún proceso o necesitas asistencia, no dudes en contactarnos.
              </p>
              <div className="space-y-1 text-sm font-montserrat">
                <p>📧 Soporte: soporte@neoconsulting.com</p>
                <p>📞 Teléfono: (01) 234-5678</p>
                <p>🕒 Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Announcement Form Component
const CreateAnnouncementForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const { suppliers } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'operativo' | 'financiero' | 'otro',
    targetRole: 'all' as 'all' | 'proveedor' | 'operaciones' | 'aprobador',
    targetSupplier: '',
    isUrgent: false,
    scheduledDate: '',
    attachments: [] as File[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const announcementData = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      targetRole: formData.targetRole === 'all' ? 'all' : formData.targetRole,
      targetSupplier: formData.targetSupplier || undefined,
      isUrgent: formData.isUrgent,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
      attachments: formData.attachments.map(file => ({
        name: file.name,
        url: '#', // In real app, this would be the uploaded file URL
        type: file.type
      })),
      createdBy: user?.name || 'Administrador',
      isActive: true
    };

    onSubmit(announcementData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Título del Comunicado *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ej: Actualización de políticas de pago"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Tipo de Comunicado *
          </label>
          <select
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
          >
            <option value="general">General</option>
            <option value="operativo">Operativo</option>
            <option value="financiero">Financiero</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Audiencia *
          </label>
          <select
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.targetRole}
            onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value as any, targetSupplier: '' }))}
          >
            <option value="all">Todos los usuarios</option>
            <option value="proveedor">Solo proveedores</option>
            <option value="operaciones">Solo operaciones</option>
            <option value="aprobador">Solo aprobadores</option>
          </select>
        </div>

        {formData.targetRole === 'proveedor' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
              Proveedor Específico (opcional)
            </label>
            <select
              className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
              value={formData.targetSupplier}
              onChange={(e) => setFormData(prev => ({ ...prev, targetSupplier: e.target.value }))}
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.businessName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
            Fecha de Publicación (opcional)
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent"
            value={formData.scheduledDate}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
          />
          <p className="text-xs text-neo-gray-500 font-montserrat mt-1">
            Si no se especifica, se publicará inmediatamente
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isUrgent"
            checked={formData.isUrgent}
            onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
            className="rounded border-neo-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="isUrgent" className="text-sm font-montserrat text-neo-gray-700 flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
            Marcar como urgente
          </label>
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
          Contenido del Comunicado *
        </label>
        <textarea
          className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent resize-none"
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Escribe el contenido del comunicado..."
          required
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
          Archivos Adjuntos (opcional)
        </label>
        <div className="border-2 border-dashed border-neo-gray-300 rounded-lg p-4 text-center">
          <FileText className="w-8 h-8 text-neo-gray-400 mx-auto mb-2" />
          <div className="space-y-2">
            <label className="inline-block">
              <span className="text-neo-accent font-montserrat font-medium cursor-pointer hover:underline">
                Seleccionar archivos
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-neo-gray-400 font-montserrat">
              PDF, JPG, PNG, DOC, DOCX - Máximo 5MB por archivo
            </p>
          </div>
        </div>

        {formData.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-montserrat font-medium text-neo-gray-700">
              Archivos seleccionados:
            </h4>
            {formData.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-neo-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-neo-accent" />
                  <span className="text-sm font-montserrat text-neo-gray-700">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-montserrat"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {formData.scheduledDate ? 'Programar Comunicado' : 'Publicar Comunicado'}
        </Button>
      </div>
    </form>
  );
};