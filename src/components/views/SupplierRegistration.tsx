import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Save, CheckCircle, UserCheck, Building2, Mail, CreditCard, Upload, FileText, X, Info } from 'lucide-react';
import { useSupabaseStorage } from '../../lib/storage';

export const SupplierRegistration: React.FC = () => {
  const { user } = useAuth();
  const { submitSupplierRegistration, hasCompletedRegistration, suppliers } = useApp();
  const { uploadFile } = useSupabaseStorage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos Obligatorios
    ruc: '',
    business_name: '',
    person_type: 'juridica' as 'natural' | 'juridica',
    country: 'Perú',
    custom_country: '',
    address: '',
    document_type: '',
    ruc_file: null as File | null,
    
    // Información de Contacto
    contact_person: '',
    contact_person_email: '',
    phone: '',
    neo_contact_email: '',
    
    // Información Bancaria - Cuenta 1 (Soles)
    bank_name_1: '',
    account_number_1: '',
    account_type_1: 'corriente' as 'corriente' | 'ahorros',
    currency_1: 'PEN' as 'PEN' | 'USD',
    cci_code_1: '',
    
    // Información Bancaria - Cuenta 2 (Dólares)
    bank_name_2: '',
    account_number_2: '',
    account_type_2: 'corriente' as 'corriente' | 'ahorros',
    currency_2: 'USD' as 'PEN' | 'USD',
    cci_code_2: ''
  });
  
  // Check if user has already completed registration
  const supplierData = user ? suppliers.find(s => s.user_id === user.id) : null;

  if (user && hasCompletedRegistration(user.id) && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent padding="large">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-neo-success bg-opacity-10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-neo-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-pt-serif font-bold text-neo-primary mb-1">
                    ✅ Tu registro se ha completado correctamente
                  </h2>
                  <p className="text-neo-gray-600 font-montserrat">
                    Revisa tu información registrada a continuación
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} size="large">
                <Save className="w-4 h-4 mr-2" />
                Editar información
              </Button>
            </div>

            <div className="bg-gradient-to-r from-neo-primary to-neo-accent text-white rounded-lg p-6 mb-6">
              <h3 className="text-xl font-pt-serif font-bold mb-2">
                📋 Datos ya completados
              </h3>
              <p className="text-blue-100 font-montserrat text-sm">
                Tu información está siendo procesada por nuestro equipo de operaciones
              </p>
            </div>

            {supplierData && (
              <div className="space-y-6">
                {/* Datos Obligatorios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Datos Obligatorios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">RUC</p>
                        <p className="font-montserrat text-neo-primary font-semibold">{supplierData.ruc}</p>
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Razón Social</p>
                        <p className="font-montserrat text-neo-primary font-semibold">{supplierData.business_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Tipo de Persona</p>
                        <p className="font-montserrat text-neo-primary capitalize">{supplierData.person_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">País</p>
                        <p className="font-montserrat text-neo-primary">{supplierData.country}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Dirección</p>
                        <p className="font-montserrat text-neo-primary">{supplierData.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información de Contacto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Información de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Persona de contacto</p>
                        <p className="font-montserrat text-neo-primary">{supplierData.contact_person}</p>
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Email de contacto</p>
                        <p className="font-montserrat text-neo-primary">{supplierData.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Teléfono</p>
                        <p className="font-montserrat text-neo-primary">{supplierData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-montserrat font-medium text-neo-gray-500">Email NEO</p>
                        <p className="font-montserrat text-neo-primary">{supplierData.neo_contact_email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Bancaria */}
                {supplierData.bank_accounts && supplierData.bank_accounts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Información Bancaria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {supplierData.bank_accounts.map((account, index) => (
                          <div key={account.id} className="bg-neo-gray-50 rounded-lg p-4">
                            <h4 className="font-pt-serif font-semibold text-neo-primary mb-3">
                              Cuenta {index + 1} - {account.currency === 'PEN' ? 'Soles' : 'Dólares'}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-neo-gray-500 font-montserrat">Banco:</span>
                                <p className="font-montserrat font-medium text-neo-primary">{account.bank_name}</p>
                              </div>
                              <div>
                                <span className="text-neo-gray-500 font-montserrat">Tipo:</span>
                                <p className="font-montserrat font-medium text-neo-primary capitalize">{account.account_type}</p>
                              </div>
                              <div>
                                <span className="text-neo-gray-500 font-montserrat">Número de cuenta:</span>
                                <p className="font-montserrat font-medium text-neo-primary">{account.account_number}</p>
                              </div>
                              <div>
                                <span className="text-neo-gray-500 font-montserrat">CCI:</span>
                                <p className="font-montserrat font-medium text-neo-primary">{account.cci_code || 'No proporcionado'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-neo-info flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-montserrat font-medium text-blue-800 mb-1">
                    Información de registro procesada
                  </h4>
                  <p className="text-sm font-montserrat text-blue-700">
                    Tu información ha sido registrada correctamente. Nuestro equipo de operaciones ha sido notificado automáticamente.
                    Si necesitas actualizar algún dato, haz clic en "Editar información".
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, ruc_file: file }));
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, ruc_file: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitWithStorage();
  };

  const handleSubmitWithStorage = async () => {
    try {
      console.log('📋 Iniciando registro de proveedor con Storage...');

      // Validación de campos obligatorios
      if (!formData.ruc || !formData.business_name || !formData.address) {
        alert('Por favor, completa todos los campos obligatorios (RUC, Razón Social y Dirección)');
        return;
      }

      if (!formData.ruc_file) {
        alert('Por favor, adjunta el archivo PDF de la Ficha RUC');
        return;
      }

      // 1. Subir archivo RUC si existe
      let ruc_file_url = null;
      console.log('📤 Subiendo archivo RUC...');
      const uploadResult = await uploadFile(
        formData.ruc_file,
        'proveedor',
        `documentos_ruc/${user?.id}`
      );

      if (uploadResult.success && uploadResult.url) {
        ruc_file_url = uploadResult.url;
        console.log('✅ Archivo RUC subido:', uploadResult.url);
      } else {
        throw new Error(`Error subiendo archivo RUC: ${uploadResult.error}`);
      }

      // 2. Mapear datos al formato de base de datos
      const supplier_data = {
        user_id: user?.id || '',
        ruc: formData.ruc,
        business_name: formData.business_name,
        person_type: formData.person_type,
        country: formData.country === 'Otros' ? formData.custom_country : formData.country,
        address: formData.address,
        document_type: formData.document_type,
        ruc_file_url: ruc_file_url,
        contact_person: formData.contact_person,
        contact_email: formData.contact_person_email,
        phone: formData.phone,
        neo_contact_email: formData.neo_contact_email
      };

      // 3. Mapear cuentas bancarias
      const bank_accounts = [
        {
          currency: 'PEN',
          bank_name: formData.bank_name_1,
          account_number: formData.account_number_1,
          account_type: formData.account_type_1,
          cci_code: formData.cci_code_1
        },
        {
          currency: 'USD',
          bank_name: formData.bank_name_2,
          account_number: formData.account_number_2,
          account_type: formData.account_type_2,
          cci_code: formData.cci_code_2
        }
      ];

      // 4. Enviar registro con datos mapeados
      console.log('💾 Guardando datos en la base de datos...');
      await submitSupplierRegistration({
        ...supplier_data,
        bank_accounts: bank_accounts
      });

      console.log('✅ Registro de proveedor enviado exitosamente con archivo en Storage');

      // 5. Mostrar mensaje de confirmación
      alert('✅ Información registrada correctamente. Tu registro ha sido enviado al equipo de operaciones.');

      // 6. Cambiar a vista de confirmación temporal y luego recargar
      setIsSubmitted(true);

      // 7. Recargar la página después de 2 segundos para mostrar la vista de "Datos ya completados"
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Error enviando registro:', error);
      alert(`❌ Error al registrar: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta nuevamente.`);
    }
  };

  const personTypeOptions = [
    { value: 'juridica', label: 'Jurídica' },
    { value: 'natural', label: 'Natural' }
  ];

  const countryOptions = [
    { value: 'Perú', label: 'Perú' },
    { value: 'México', label: 'México' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'España', label: 'España' },
    { value: 'Otros', label: 'Otros' }
  ];

  const documentTypeOptions = [
    { value: 'factura', label: 'Factura' },
    { value: 'rhe', label: 'Recibo por Honorarios' }
  ];

  const accountTypeOptions = [
    { value: 'corriente', label: 'Corriente' },
    { value: 'ahorros', label: 'Ahorros' }
  ];

  const currencyOptions = [
    { value: 'PEN', label: 'Soles (PEN)' },
    { value: 'USD', label: 'Dólares (USD)' }
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent padding="large">
            <div className="w-20 h-20 bg-neo-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-neo-success" />
            </div>
            <h2 className="text-3xl font-pt-serif font-bold text-neo-primary mb-4">
              ✅ Información registrada correctamente
            </h2>
            <p className="text-neo-gray-700 font-montserrat mb-6 text-lg">
              Tu registro ha sido completado exitosamente y guardado en nuestra base de datos.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-neo-success flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-montserrat font-semibold text-green-800 mb-2">
                    📧 Notificación automática enviada
                  </h3>
                  <p className="text-sm font-montserrat text-green-700 mb-2">
                    El equipo de operaciones ha sido notificado automáticamente de tu registro.
                  </p>
                  <p className="text-xs font-montserrat text-green-600">
                    <strong>Correo enviado a:</strong> operaciones@neo.com
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-neo-info" />
                <p className="text-sm font-montserrat text-blue-800 font-semibold">
                  Cargando tu perfil...
                </p>
              </div>
              <p className="text-xs font-montserrat text-blue-700">
                En unos segundos verás tus datos completados con la opción de editarlos.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-neo-gray-500">
              <div className="w-2 h-2 bg-neo-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-neo-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-neo-accent rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          📄 Registro del Proveedor
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Complete su información para registrarse como proveedor de NEO Consulting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos Obligatorios Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Datos Obligatorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="RUC"
                value={formData.ruc}
                onChange={(e) => handleInputChange('ruc', e.target.value)}
                placeholder="20123456789"
                required
              />
              
              <Input
                label="Razón Social"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                placeholder="Empresa ABC SAC"
                required
              />
              
              <Select
                label="Tipo de Persona"
                options={personTypeOptions}
                value={formData.person_type}
                onChange={(e) => handleInputChange('person_type', e.target.value)}
                required
              />
              
              <Select
                label="País"
                options={countryOptions}
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
              />
              
              {formData.country === 'Otros' && (
                <div className="md:col-span-2">
                  <Input
                    label="Especifique su país"
                    value={formData.custom_country}
                    onChange={(e) => handleInputChange('custom_country', e.target.value)}
                    placeholder="Escriba el nombre de su país"
                    required
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <Input
                  label="Dirección"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Av. Javier Prado Este 123, San Isidro, Lima"
                  required
                />
              </div>
              
              <Select
                label="Tipo de Comprobante a Emitir"
                options={documentTypeOptions}
                value={formData.document_type}
                onChange={(e) => handleInputChange('document_type', e.target.value)}
                required
              />
            </div>

            {/* RUC File Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
                Adjuntar Ficha RUC *
              </label>
              <div className="border-2 border-dashed border-neo-gray-300 rounded-lg p-4 text-center hover:border-neo-accent transition-colors">
                <Upload className="w-8 h-8 text-neo-gray-400 mx-auto mb-2" />
                <div className="space-y-2">
                  <label className="inline-block">
                    <span className="text-neo-accent font-montserrat font-medium cursor-pointer hover:underline">
                      Seleccionar archivo PDF
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                      required={!formData.ruc_file}
                    />
                  </label>
                  <div className="flex items-center justify-center space-x-2">
                    <Info className="w-4 h-4 text-neo-info" />
                    <p className="text-xs text-neo-info font-montserrat">
                      Solo se permiten archivos PDF - Obligatorio
                    </p>
                  </div>
                </div>
                {formData.ruc_file && (
                  <div className="mt-3 p-2 bg-neo-gray-50 rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-neo-accent" />
                      <span className="text-sm font-montserrat text-neo-gray-700">
                        {formData.ruc_file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Persona de contacto"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                placeholder="Juan Pérez García"
              />
              
              <Input
                label="Email de la persona de contacto"
                type="email"
                value={formData.contact_person_email}
                onChange={(e) => handleInputChange('contact_person_email', e.target.value)}
                placeholder="juan.perez@empresa.com"
              />
              
              <Input
                label="Teléfono"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="01-234-5678"
              />
              
              <Input
                label="Correo de NEO que solicitó el servicio"
                type="email"
                value={formData.neo_contact_email}
                onChange={(e) => handleInputChange('neo_contact_email', e.target.value)}
                placeholder="contacto@neoconsulting.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Banking Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Información Bancaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Informational Text */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-neo-info flex-shrink-0 mt-0.5" />
                <p className="text-sm font-montserrat text-blue-800">
                  <strong>Es indispensable llenar 2 tipos de cuenta:</strong><br />
                  1. En soles y 2. En dólares
                </p>
              </div>
            </div>

            {/* Cuenta 1 - Soles */}
            <div className="mb-8">
              <h4 className="text-lg font-pt-serif font-semibold text-neo-primary mb-4 border-b border-neo-gray-200 pb-2">
                Cuenta 1 - Soles (PEN)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Banco"
                  value={formData.bank_name_1}
                  onChange={(e) => handleInputChange('bank_name_1', e.target.value)}
                  placeholder="Banco de Crédito del Perú"
                />
                
                <Input
                  label="Número de cuenta bancaria"
                  value={formData.account_number_1}
                  onChange={(e) => handleInputChange('account_number_1', e.target.value)}
                  placeholder="194-123456789-0-12"
                />
                
                <Select
                  label="Tipo de cuenta"
                  options={accountTypeOptions}
                  value={formData.account_type_1}
                  onChange={(e) => handleInputChange('account_type_1', e.target.value)}
                />
                
                <div>
                  <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
                    Tipo de moneda
                  </label>
                  <input
                    type="text"
                    value="Soles (PEN)"
                    className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat bg-gray-100"
                    disabled
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Código CCI"
                    value={formData.cci_code_1}
                    onChange={(e) => handleInputChange('cci_code_1', e.target.value)}
                    placeholder="00219400123456789012"
                    helper="Código de Cuenta Interbancaria (20 dígitos)"
                  />
                </div>
              </div>
            </div>

            {/* Cuenta 2 - Dólares */}
            <div>
              <h4 className="text-lg font-pt-serif font-semibold text-neo-primary mb-4 border-b border-neo-gray-200 pb-2">
                Cuenta 2 - Dólares (USD)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Banco"
                  value={formData.bank_name_2}
                  onChange={(e) => handleInputChange('bank_name_2', e.target.value)}
                  placeholder="Banco Interbank"
                />
                
                <Input
                  label="Número de cuenta bancaria"
                  value={formData.account_number_2}
                  onChange={(e) => handleInputChange('account_number_2', e.target.value)}
                  placeholder="898-123456789-0-15"
                />
                
                <Select
                  label="Tipo de cuenta"
                  options={accountTypeOptions}
                  value={formData.account_type_2}
                  onChange={(e) => handleInputChange('account_type_2', e.target.value)}
                />
                
                <div>
                  <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
                    Tipo de moneda
                  </label>
                  <input
                    type="text"
                    value="Dólares (USD)"
                    className="w-full px-3 py-2 border border-neo-gray-300 rounded-lg font-montserrat bg-gray-100"
                    disabled
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Código CCI"
                    value={formData.cci_code_2}
                    onChange={(e) => handleInputChange('cci_code_2', e.target.value)}
                    placeholder="00389800123456789015"
                    helper="Código de Cuenta Interbancaria (20 dígitos)"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="large" className="min-w-48">
            <UserCheck className="w-4 h-4 mr-2" />
            Enviar información
          </Button>
        </div>
      </form>

      {/* Information Card */}
      <Card className="bg-gradient-to-r from-neo-primary to-neo-accent text-white">
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-pt-serif font-bold mb-2">
                Información Importante
              </h3>
              <div className="space-y-2 text-sm font-montserrat">
                <p>• Los campos marcados con (*) son obligatorios</p>
                <p>• Su información será revisada por nuestro equipo</p>
                <p>• Recibirá una confirmación una vez aprobado su registro</p>
                <p>• Para consultas, contacte a nuestro equipo de soporte</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};