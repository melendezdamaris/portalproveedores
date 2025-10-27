import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Save, Upload, FileText, CheckCircle, Info, X } from 'lucide-react';

export const SupplierConfiguration: React.FC = () => {
  const { user } = useAuth();
  const { suppliers } = useApp();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Get current supplier data
  const currentSupplier = suppliers.find(s => s.user_id === user?.id);
  
  const [formData, setFormData] = useState({
    // General Data
    business_name: currentSupplier?.business_name || '',
    ruc: currentSupplier?.ruc || '',
    person_type: currentSupplier?.person_type || ('juridica' as 'natural' | 'juridica'),
    country: currentSupplier?.country || 'Perú',
    custom_country: '',
    fiscal_address: currentSupplier?.address || '',
    contracted_service: '',
    contact_email: currentSupplier?.contact_email || '',
    contact_phone: currentSupplier?.phone || '',
    ruc_file: null as File | null,
    
    // Banking Information
    currency: 'PEN' as 'PEN' | 'USD',
    account_type: 'corriente' as 'corriente' | 'ahorros',
    account_number: currentSupplier?.bank_accounts?.[0]?.account_number || '',
    cci_code: currentSupplier?.bank_accounts?.[0]?.cci_code || '',
    
    // Additional Information (for juridica only)
    employee_count: '',
    has_diversity: false,
    diversity_percentage: '',
    annual_revenue: '',
    reference_clients: '',
    certifications: '',
    certifications_file: null as File | null
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapear datos al formato de base de datos
    const mapped_data = {
      user_id: user?.id,
      business_name: formData.business_name,
      ruc: formData.ruc,
      person_type: formData.person_type,
      country: formData.country === 'Otros' ? formData.custom_country : formData.country,
      address: formData.fiscal_address,
      contact_person: formData.business_name,
      contact_email: formData.contact_email,
      phone: formData.contact_phone,
      ...(formData.contracted_service && { contracted_service: formData.contracted_service }),
      ...(formData.person_type === 'juridica' && {
        employee_count: formData.employee_count,
        has_diversity: formData.has_diversity,
        diversity_percentage: formData.diversity_percentage,
        annual_revenue: formData.annual_revenue,
        reference_clients: formData.reference_clients,
        certifications: formData.certifications
      })
    };

    // Mapear cuenta bancaria
    const bank_account = {
      currency: formData.currency,
      bank_name: formData.bank_name || '',
      account_number: formData.account_number,
      account_type: formData.account_type,
      cci_code: formData.cci_code
    };

    console.log('Saving configuration:', { mapped_data, bank_account, files: { ruc_file: formData.ruc_file, certifications_file: formData.certifications_file } });
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  const removeFile = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  const personTypeOptions = [
    { value: 'natural', label: 'Persona Natural' },
    { value: 'juridica', label: 'Persona Jurídica' }
  ];

  const currencyOptions = [
    { value: 'PEN', label: 'Soles' },
    { value: 'USD', label: 'Dólares' }
  ];

  const accountTypeOptions = [
    { value: 'corriente', label: 'Corriente' },
    { value: 'ahorros', label: 'Ahorros' }
  ];

  const employeeCountOptions = [
    { value: 'none', label: 'Ningún trabajador' },
    { value: '0-20', label: 'Entre 0 a 20' },
    { value: '21-50', label: 'Entre 21 a 50' },
    { value: '51-100', label: 'Entre 51 a 100' },
    { value: '100+', label: 'Más de 100' }
  ];

  const countryOptions = [
    { value: 'Perú', label: 'Perú' },
    { value: 'México', label: 'México' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'España', label: 'España' },
    { value: 'Otros', label: 'Otros' }
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent padding="large">
            <div className="w-16 h-16 bg-neo-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-neo-success" />
            </div>
            <h2 className="text-2xl font-pt-serif font-bold text-neo-primary mb-4">
              ¡Configuración Guardada!
            </h2>
            <p className="text-neo-gray-600 font-montserrat mb-6">
              Su información ha sido actualizada correctamente. Los cambios se reflejarán 
              en todo el sistema.
            </p>
            <Button onClick={() => setIsSubmitted(false)}>
              Continuar Editando
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          Configuración del Proveedor
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Actualice su información personal y empresarial
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>1. Datos Generales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre completo o razón social"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                required
              />
              
              <Input
                label="RUC"
                value={formData.ruc}
                onChange={(e) => handleInputChange('ruc', e.target.value)}
                required
              />
              
              <Select
                label="Tipo de persona"
                options={personTypeOptions}
                value={formData.person_type}
                onChange={(e) => handleInputChange('person_type', e.target.value)}
                required
              />
              
              <div>
                <Select
                  label="País"
                  options={countryOptions}
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
                {/* Show custom country field when "Otros" is selected */}
                {formData.country === 'Otros' && (
                  <div className="mt-3">
                    <Input
                      label="Por favor, indique su país"
                      value={formData.custom_country}
                      onChange={(e) => handleInputChange('custom_country', e.target.value)}
                      placeholder="Escriba el nombre de su país"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="Domicilio fiscal"
                  value={formData.fiscal_address}
                  onChange={(e) => handleInputChange('fiscal_address', e.target.value)}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Servicio para el cual fue contratado"
                  value={formData.contracted_service}
                  onChange={(e) => handleInputChange('contracted_service', e.target.value)}
                  placeholder="Describa los servicios que presta a NEO Consulting..."
                />
              </div>
              
              <Input
                label="Correo electrónico del contacto principal"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                required
              />
              
              <Input
                label="Celular del contacto principal"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                required
              />
            </div>

            {/* RUC File Upload - Moved to General Data section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
                Ficha RUC / CSF o RUT (PDF obligatorio) *
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
                      onChange={(e) => handleFileChange('ruc_file', e.target.files?.[0] || null)}
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
                      onClick={() => removeFile('ruc_file')}
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

        {/* Banking Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>2. Información Bancaria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Moneda"
                options={currencyOptions}
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                required
              />
              
              <Select
                label="Tipo de cuenta"
                options={accountTypeOptions}
                value={formData.account_type}
                onChange={(e) => handleInputChange('account_type', e.target.value)}
                required
              />
              
              <Input
                label="Nombre del banco"
                value={formData.bank_name || ''}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                placeholder="Banco de Crédito del Perú"
              />
              
              <Input
                label="Número de cuenta bancaria"
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                required
              />
              
              <Input
                label="Número de cuenta interbancaria (CCI)"
                value={formData.cci_code}
                onChange={(e) => handleInputChange('cci_code', e.target.value)}
                helper="20 dígitos del código de cuenta interbancaria"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Section - Only for Juridica */}
        {formData.person_type === 'juridica' && (
          <Card>
            <CardHeader>
              <CardTitle>3. Información Adicional (Persona Jurídica)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Select
                  label="Número de trabajadores"
                  options={employeeCountOptions}
                  value={formData.employee_count}
                  onChange={(e) => handleInputChange('employee_count', e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-neo-gray-700 mb-3 font-montserrat">
                    ¿Diversidad de género y/o minorías en socios o accionistas?
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="has_diversity"
                        checked={formData.has_diversity === true}
                        onChange={() => handleInputChange('has_diversity', true)}
                        className="text-neo-accent focus:ring-neo-accent"
                      />
                      <span className="font-montserrat text-neo-gray-700">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="has_diversity"
                        checked={formData.has_diversity === false}
                        onChange={() => handleInputChange('has_diversity', false)}
                        className="text-neo-accent focus:ring-neo-accent"
                      />
                      <span className="font-montserrat text-neo-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <Input
                  label="Porcentaje de diversidad entre colaboradores"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.diversity_percentage}
                  onChange={(e) => handleInputChange('diversity_percentage', e.target.value)}
                  helper="Ingrese el porcentaje (0-100)"
                />

                <Input
                  label="Facturación anual (en soles)"
                  type="number"
                  value={formData.annual_revenue}
                  onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                  placeholder="Ej: 500000"
                  required
                />

                <Textarea
                  label="Clientes de referencia actuales"
                  value={formData.reference_clients}
                  onChange={(e) => handleInputChange('reference_clients', e.target.value)}
                  placeholder="Liste sus principales clientes actuales..."
                  rows={3}
                />

                <div>
                  <Textarea
                    label="Certificaciones"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="Describa las certificaciones que posee su empresa..."
                    rows={3}
                  />
                  
                  {/* Certifications File Upload */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neo-gray-700 mb-2 font-montserrat">
                      Adjuntar Certificaciones (Opcional)
                    </label>
                    <div className="border-2 border-dashed border-neo-gray-300 rounded-lg p-4 text-center hover:border-neo-accent transition-colors">
                      <Upload className="w-6 h-6 text-neo-gray-400 mx-auto mb-2" />
                      <div className="space-y-2">
                        <label className="inline-block">
                          <span className="text-neo-accent font-montserrat font-medium cursor-pointer hover:underline">
                            Seleccionar archivo PDF
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange('certifications_file', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        <div className="flex items-center justify-center space-x-2">
                          <Info className="w-4 h-4 text-neo-info" />
                          <p className="text-xs text-neo-info font-montserrat">
                            Solo se permiten archivos PDF
                          </p>
                        </div>
                      </div>
                      {formData.certifications_file && (
                        <div className="mt-3 p-2 bg-neo-gray-50 rounded flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-neo-accent" />
                            <span className="text-sm font-montserrat text-neo-gray-700">
                              {formData.certifications_file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('certifications_file')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="large" className="min-w-48">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>

      {/* Important Information Section */}
      <Card className="bg-gradient-to-r from-neo-primary to-neo-accent text-white">
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Info className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-pt-serif font-bold mb-4">
                Información Importante
              </h3>
              <div className="space-y-2 font-montserrat">
                <p>• Mantenga su información actualizada para evitar retrasos en los pagos</p>
                <p>• Los archivos PDF son obligatorios para validar su información fiscal</p>
                <p>• Los cambios pueden tardar hasta 24 horas en reflejarse completamente</p>
                <div className="mt-4">
                  <p className="font-semibold mb-2">Para soporte técnico contactar a:</p>
                  <div className="space-y-1 text-sm">
                    <p>• alisson.trauco@neo.com.pe</p>
                    <p>• lizbeth.zamora@neo.com.pe</p>
                    <p>• manuel.falcon@neo.com.pe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};