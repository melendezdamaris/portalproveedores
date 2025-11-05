
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSuppliers, useCompanyDocuments } from '../../hooks/useSupabase';
import { Supplier, BankAccount, PortalUser } from '../../types';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader2 } from 'lucide-react';

// Vista para cuando el proveedor ya está registrado
const AlreadyRegisteredView = ({ supplierData }: { supplierData: Supplier }) => {
  if (!supplierData) {
    return (
      <Card className="w-full max-w-4xl p-8">
        <CardHeader>
          <CardTitle>Cargando Registro...</CardTitle>
          <p className="text-gray-600 mt-2">Estamos recuperando la información de tu registro. Un momento por favor.</p>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl p-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-green-600">¡Tu registro se ha completado!</CardTitle>
        <p className="text-lg text-gray-600 mt-2">
          Gracias por unirte a nuestro portal. Tu información ha sido registrada y está siendo revisada.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Resumen de tu Registro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <label className="font-semibold text-gray-500">Razón Social</label>
              <p className="text-gray-900">{supplierData.businessName}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500">RUC</label>
              <p className="text-gray-900">{supplierData.ruc}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500">Tipo de Persona</label>
              <p className="text-gray-900 capitalize">{supplierData.personType}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500">Estado del Registro</label>
              <p className="text-gray-900 font-medium capitalize">{supplierData.status}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500">Persona de Contacto</label>
              <p className="text-gray-900">{supplierData.contactPerson}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-500">Email de Contacto</label>
              <p className="text-gray-900">{supplierData.contactEmail}</p>
            </div>
          </div>
        </div>
        {supplierData.bankAccounts && supplierData.bankAccounts.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Cuentas Bancarias Registradas</h3>
            <ul className="space-y-4">
              {supplierData.bankAccounts.map((account: BankAccount, index: number) => (
                <li key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                    <div>
                      <label className="font-semibold text-gray-500">Banco</label>
                      <p className="text-gray-900">{account.bankName}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-500">Nº de Cuenta</label>
                      <p className="text-gray-900">{account.accountNumber}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-500">Moneda</label>
                      <p className="text-gray-900">{account.currency}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Vista del formulario de registro
const RegistrationFormView = ({ portalUser, submitSupplierRegistration, uploadFile }: { portalUser: PortalUser, submitSupplierRegistration: Function, uploadFile: Function }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rucFile, setRucFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setRucFile(event.target.files[0]);
    }
  };

  const handleSubmitWithStorage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!rucFile) {
      setError("Por favor, adjunta tu Ficha RUC.");
      return;
    }

    if (!portalUser?.id) {
      setError("No se ha podido identificar al usuario. Por favor, inicia sesión de nuevo.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Subiendo Ficha RUC...');
      const fileName = `ruc-${portalUser.id}-${Date.now()}`;
      const uploadResult = await uploadFile(rucFile, 'documentos_ruc', fileName);

      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error(uploadResult.error || 'Error desconocido al subir el archivo RUC');
      }
      
      console.log('Ficha RUC subida exitosamente:', uploadResult.publicUrl);

      const formData = new FormData(event.currentTarget);
      const registrationData = {
        portalUserId: portalUser.id,
        email: portalUser.email,
        ruc: formData.get('ruc') as string,
        businessName: formData.get('businessName') as string,
        tradeName: formData.get('tradeName') as string,
        personType: formData.get('personType') as string,
        country: formData.get('country') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
        contactPerson: formData.get('contactPerson') as string,
        contactEmail: formData.get('contactEmail') as string,
        contactPhone: formData.get('contactPhone') as string,
        bankName1: formData.get('bankName1') as string,
        accountNumber1: formData.get('accountNumber1') as string,
        cci_code_1: formData.get('cciCode1') as string,
        bankName2: formData.get('bankName2') as string,
        accountNumber2: formData.get('accountNumber2') as string,
        cci_code_2: formData.get('cciCode2') as string,
        rucFileUrl: uploadResult.publicUrl,
      };

      console.log('Enviando datos de registro a la base de datos...');
      await submitSupplierRegistration(registrationData);
      console.log('¡Registro completado exitosamente!');

    } catch (err: any) {
      console.error("Error en el proceso de registro:", err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitWithStorage} className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Registro de Proveedor</CardTitle>
          <p className="text-gray-600 mt-2">Completa el formulario para registrarte en el portal.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Datos de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="ruc">RUC</label>
                <Input id="ruc" name="ruc" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="businessName">Razón Social</label>
                <Input id="businessName" name="businessName" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="tradeName">Nombre Comercial</label>
                <Input id="tradeName" name="tradeName" />
              </div>
              <div className="space-y-2">
                <label htmlFor="personType">Tipo de Persona</label>
                <select name="personType" defaultValue="juridica" className="w-full p-2 border rounded-md bg-white">
                    <option value="natural">Natural</option>
                    <option value="juridica">Jurídica</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="country">País</label>
                <Input id="country" name="country" defaultValue="Perú" />
              </div>
              <div className="space-y-2">
                <label htmlFor="address">Dirección Fiscal</label>
                <Input id="address" name="address" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone">Teléfono</label>
                <Input id="phone" name="phone" required />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Datos de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contactPerson">Persona de Contacto</label>
                <Input id="contactPerson" name="contactPerson" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="contactEmail">Email de Contacto</label>
                <Input id="contactEmail" name="contactEmail" type="email" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="contactPhone">Teléfono de Contacto</label>
                <Input id="contactPhone" name="contactPhone" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Cuentas Bancarias</h3>
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Cuenta Principal (Soles - PEN)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="bankName1">Banco</label>
                    <Input id="bankName1" name="bankName1" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="accountNumber1">Nº de Cuenta</label>
                    <Input id="accountNumber1" name="accountNumber1" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cciCode1">CCI</label>
                    <Input id="cciCode1" name="cciCode1" />
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Cuenta Secundaria (Dólares - USD)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="bankName2">Banco</label>
                    <Input id="bankName2" name="bankName2" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="accountNumber2">Nº de Cuenta</label>
                    <Input id="accountNumber2" name="accountNumber2" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cciCode2">CCI</label>
                    <Input id="cciCode2" name="cciCode2" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Documentos</h3>
            <div className="space-y-2">
              <label htmlFor="rucFile">Ficha RUC (PDF o Imagen)</label>
              <Input id="rucFile" name="rucFile" type="file" required onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </section>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Finalizar Registro'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

const SupplierRegistration = () => {
  const [loading, setLoading] = useState(true);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [supplierData, setSupplierData] = useState<Supplier | null>(null);
  
  const { createSupplier, suppliers } = useSuppliers();
  const { uploadFileToStorage } = useCompanyDocuments();

  useEffect(() => {
    const fetchUserAndSupplier = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: portalUserData, error: portalUserError } = await supabase
          .from('portal_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (portalUserError) {
            console.error("Error fetching portal user:", portalUserError);
        }

        if (portalUserData) {
          setPortalUser(portalUserData);
          
          const { data: supplier, error: supplierError } = await supabase
            .from('suppliers')
            .select('*, bank_accounts(*)')
            .eq('portal_user_id', portalUserData.id)
            .single();

          if (supplierError && supplierError.code !== 'PGRST116') { // PGRST116 = no rows returned
              console.error("Error fetching supplier:", supplierError);
          }
            
          if (supplier) {
            const formattedSupplier: Supplier = {
              id: supplier.id,
              portalUserId: supplier.portal_user_id,
              ruc: supplier.ruc,
              businessName: supplier.business_name,
              tradeName: supplier.trade_name,
              personType: supplier.person_type,
              country: supplier.country,
              address: supplier.address,
              phone: supplier.phone,
              email: supplier.email,
              contactPerson: supplier.contact_person,
              contactPhone: supplier.contact_phone,
              contactEmail: supplier.contact_email,
              contractedService: supplier.contracted_service,
              documentType: supplier.document_type,
              rucFileUrl: supplier.ruc_file_url,
              bankAccounts: (supplier.bank_accounts || []).map((acc: any) => ({
                id: acc.id,
                bankName: acc.bank_name,
                accountNumber: acc.account_number,
                accountType: acc.account_type,
                currency: acc.currency,
                cciCode: acc.cci_code,
                isPrimary: acc.is_primary
              })),
              status: supplier.status,
              createdAt: new Date(supplier.created_at),
              updatedAt: new Date(supplier.updated_at),
            };
            setSupplierData(formattedSupplier);
          }
        }
      }
      setLoading(false);
    };

    fetchUserAndSupplier();
  }, [suppliers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (supplierData && supplierData.status !== 'pending') {
    return <AlreadyRegisteredView supplierData={supplierData} />;
  }
  
  if (portalUser) {
    return <RegistrationFormView portalUser={portalUser} submitSupplierRegistration={createSupplier} uploadFile={uploadFileToStorage} />;
  }

  return (
      <Card className="w-full max-w-lg mx-auto mt-10">
          <CardHeader>
              <CardTitle>Acceso Requerido</CardTitle>
              <p className="text-gray-600 mt-2">Por favor, inicia sesión para registrarte como proveedor.</p>
          </CardHeader>
      </Card>
  );
};

export default SupplierRegistration;
