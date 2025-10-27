import React from 'react';
import { DashboardStats } from '../dashboard/DashboardStats';
import { RecentActivity } from '../dashboard/RecentActivity';
import { Card, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { AlertCircle, CheckCircle, FileText, UserCheck, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasCompletedRegistration, syncState, dataFlowEvents } = useApp();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
    return `${greeting}, ${user?.name}`;
  };

  // Check if user has completed registration (only for providers)
  const registrationCompleted = user?.role === 'proveedor' ? hasCompletedRegistration(user?.id || '') : true;
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-neo-gray-200 p-6">
        <h1 className="text-3xl font-pt-serif font-bold text-neo-primary mb-2">
          {getWelcomeMessage()}
        </h1>
        <p className="text-neo-gray-600 font-montserrat">
          Bienvenido al Portal de Proveedores de NEO Consulting
        </p>
      </div>

      {/* Registration Steps Notification - Only for Providers */}
      {user?.role === 'proveedor' && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-pt-serif font-bold text-blue-800 mb-4">
                  📋 Pasos a Seguir para Registrarse
                </h3>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex-shrink-0">
                      {registrationCompleted ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <h4 className="font-montserrat font-semibold text-blue-800">
                          {registrationCompleted ? '✅ Paso 1 Completado' : 'Paso 1: Registro de Proveedor'}
                        </h4>
                      </div>
                      <p className="text-sm font-montserrat text-blue-700 mb-3">
                        {registrationCompleted 
                          ? 'Has completado exitosamente tu registro como proveedor. Tu información ha sido enviada para validación.'
                          : 'Primero debes afiliarte como proveedor en la sección "Registro del Proveedor". Una vez que este sea validado te llegará un correo de confirmación.'
                        }
                      </p>
                      {!registrationCompleted && (
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-montserrat font-medium text-blue-600">
                            Ir a "Registro del Proveedor"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    registrationCompleted 
                      ? 'bg-white border-blue-200' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        registrationCompleted ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className={`w-5 h-5 ${registrationCompleted ? 'text-blue-600' : 'text-gray-400'}`} />
                        <h4 className={`font-montserrat font-semibold ${
                          registrationCompleted ? 'text-blue-800' : 'text-gray-500'
                        }`}>
                          Paso 2: Registro de Comprobantes
                        </h4>
                      </div>
                      <p className={`text-sm font-montserrat mb-3 ${
                        registrationCompleted ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {registrationCompleted 
                          ? 'Ya puedes ingresar tu factura en la sección "Registrar Comprobantes". Asegúrate de adjuntar tanto la factura PDF como los entregables correspondientes.'
                          : 'Una vez completado el Paso 1, podrás registrar tus comprobantes de pago.'
                        }
                      </p>
                      {registrationCompleted && (
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-montserrat font-medium text-blue-600">
                            Ir a "Registrar Comprobantes"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
      {/* Stats */}
      <DashboardStats />

                {/* Additional Information */}
                <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-montserrat font-semibold text-blue-800 mb-2">
                        📧 Información Importante
                      </h4>
                      <ul className="text-sm font-montserrat text-blue-700 space-y-1">
                        <li>• Una vez completado el registro, recibirás un correo de confirmación</li>
                        <li>• El proceso de validación puede tomar hasta 24-48 horas</li>
                        <li>• Para consultas, contacta a: alisson.trauco@neo.com.pe</li>
                        <li>• Todos los campos marcados con (*) son obligatorios</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* 🎯 ESTADO DE SINCRONIZACIÓN */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-montserrat font-semibold text-green-800 mb-2">
                        🎯 Sistema de Sincronización Activo
                      </h4>
                      <div className="text-sm font-montserrat text-green-700 space-y-1">
                        <p>• <strong>Última sincronización:</strong> {syncState?.lastSync?.toLocaleTimeString() || 'Iniciando...'}</p>
                        <p>• <strong>Estado:</strong> {syncState?.syncInProgress ? '🔄 Sincronizando...' : '✅ Actualizado'}</p>
                        <p>• <strong>Versión de datos:</strong> v{syncState?.dataVersion || 1}</p>
                        <p>• Los datos se sincronizan automáticamente entre perfiles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};