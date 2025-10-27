import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  filePath?: string;
  publicUrl?: string | null;
}

export class SupabaseStorageService {
  // ✅ Subir un solo archivo
  static async uploadFile(
    file: File,
    userRole: 'proveedor' | 'aprobador' | 'operaciones',
    customPath?: string
  ) {
    try {
      // 🔐 Obtener usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado.');
      const uid = user.id;

      // 📁 Definir carpeta base según el rol
      const folderPath =
        userRole === 'proveedor'
          ? 'proveedor'
          : userRole === 'aprobador'
          ? 'aprobador'
          : 'operaciones';

      // 🧩 Crear nombre único
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/\s+/g, '_');
      const uniqueFileName = `${timestamp}-${sanitizedFileName}`;

      // 🧱 Construir ruta con UID
      const fullPath = customPath
        ? `${folderPath}/${customPath}/${uid}/${uniqueFileName}`
        : `${folderPath}/${uid}/${uniqueFileName}`;

      // ☁️ Subir al bucket 'documentos'
      const { data, error } = await supabase
        .storage
        .from('documentos')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error detallado en uploadFile:', error);
        throw new Error(error.message || JSON.stringify(error));
      }

      // 🔗 Obtener URL pública
      const { data: urlData } = supabase
        .storage
        .from('documentos')
        .getPublicUrl(fullPath);

      return {
        success: true,
        fileName: uniqueFileName,
        filePath: fullPath,
        publicUrl: urlData?.publicUrl || null,
      };
    } catch (err: any) {
      console.error('Error al subir archivo:', err.message);
      return { success: false, error: `Error subiendo archivo: ${err.message}` };
    }
  }

  // ✅ Subir múltiples archivos
  static async uploadMultipleFiles(
    files: File[],
    userRole: 'proveedor' | 'aprobador' | 'operaciones',
    customPath?: string
  ) {
    try {
      const results = await Promise.all(
        files.map((file) => this.uploadFile(file, userRole, customPath))
      );
      return results;
    } catch (error: any) {
      console.error('Error en uploadMultipleFiles:', error.message);
      return [{ success: false, error: error.message }];
    }
  }

  // ✅ Eliminar archivo
  static async deleteFile(filePath: string) {
    try {
      const { error } = await supabase.storage.from('documentos').remove([filePath]);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar archivo:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ✅ Obtener URL pública
  static getPublicUrl(filePath: string) {
    const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);
    return data?.publicUrl || null;
  }

  // ✅ Listar archivos por rol o ruta
  static async listFiles(
    userRole: 'proveedor' | 'aprobador' | 'operaciones',
    customPath?: string
  ) {
    try {
      const path = customPath ? `${userRole}/${customPath}` : `${userRole}`;
      const { data, error } = await supabase.storage.from('documentos').list(path);
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error al listar archivos:', error.message);
      return [];
    }
  }

  // ✅ Obtener uso o cantidad de archivos
  static async getStorageUsage(userRole: 'proveedor' | 'aprobador' | 'operaciones') {
    try {
      const { data, error } = await supabase.storage.from('documentos').list(userRole);
      if (error) throw error;
      return data?.length || 0;
    } catch (error: any) {
      console.error('Error al obtener uso del storage:', error.message);
      return 0;
    }
  }
}

// ✅ Hook personalizado para usar el servicio
export const useSupabaseStorage = () => {
  const uploadFile = async (
    file: File,
    userRole: 'proveedor' | 'aprobador' | 'operaciones',
    customPath?: string
  ) => await SupabaseStorageService.uploadFile(file, userRole, customPath);

  const uploadMultipleFiles = async (
    files: File[],
    userRole: 'proveedor' | 'aprobador' | 'operaciones',
    customPath?: string
  ) => await SupabaseStorageService.uploadMultipleFiles(files, userRole, customPath);

  const deleteFile = async (filePath: string) =>
    await SupabaseStorageService.deleteFile(filePath);

  const getPublicUrl = (filePath: string) =>
    SupabaseStorageService.getPublicUrl(filePath);

  const listFiles = async (
    userRole: 'proveedor' | 'aprobador' | 'operaciones',
    customPath?: string
  ) => await SupabaseStorageService.listFiles(userRole, customPath);

  const getStorageUsage = async (userRole: 'proveedor' | 'aprobador' | 'operaciones') =>
    await SupabaseStorageService.getStorageUsage(userRole);

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getPublicUrl,
    listFiles,
    getStorageUsage,
  };
};
