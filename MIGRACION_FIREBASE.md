# Análisis del Backend y Migración a Firebase

## 📊 Análisis del Backend Actual

### Arquitectura Actual: Supabase (BaaS)

El proyecto **Portal Proveedores** actualmente utiliza **Supabase** como Backend-as-a-Service (BaaS), que proporciona:

- **Base de datos**: PostgreSQL con capacidades en tiempo real
- **Autenticación**: Sistema de usuarios con JWT
- **Almacenamiento**: Supabase Storage para archivos
- **Seguridad**: Row-Level Security (RLS) en PostgreSQL

**Stack Tecnológico:**
- Frontend: React 18.3 + TypeScript + Vite
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Estado: Zustand 5.0.7
- UI: Tailwind CSS 3.4.1
- HTTP: Axios 1.11.0

---

## 🗄️ Estructura de Datos Actual

### Tablas Principales (11 tablas)

1. **portal_users** - Usuarios del portal (proveedor, aprobador, operaciones)
2. **suppliers** - Información de proveedores (RUC, razón social, estado)
3. **bank_accounts** - Cuentas bancarias de proveedores
4. **invoices** - Facturas/documentos presentados
5. **payments** - Pagos y seguimiento
6. **company_documents** - Documentos compartidos
7. **announcements** - Anuncios del sistema
8. **announcement_attachments** - Adjuntos de anuncios
9. **feedback_surveys** - Encuestas de satisfacción
10. **deliverable_files** - Archivos de entregables
11. **proveedores** - Tabla alternativa de proveedores

### Vistas Computadas (4 vistas)

- `vw_supplier_dashboard` - Estadísticas del proveedor
- `vw_approver_dashboard` - Estadísticas del aprobador
- `vw_approver_inbox` - Bandeja de aprobaciones
- `vw_payment_queue` - Cola de pagos

### Sistema de Autenticación

- Email/password con Supabase Auth
- JWT tokens automáticos
- 3 roles: `proveedor`, `aprobador`, `operaciones`
- RLS (Row-Level Security) para control de acceso

### Almacenamiento de Archivos

**Bucket**: `documentos/`

```
documentos/
├── proveedor/
│   ├── documentos_ruc/      # Documentos RUC
│   ├── facturas/             # Facturas
│   └── entregables/          # Entregables
├── aprobador/
│   └── documentos/           # Documentos del aprobador
└── operaciones/
    └── documentos/           # Documentos de operaciones
```

---

## 🔥 Estrategia de Migración a Firebase

### Comparación Firebase vs Supabase

| Componente | Supabase Actual | Firebase Equivalente |
|------------|-----------------|---------------------|
| Base de datos | PostgreSQL (SQL) | Cloud Firestore (NoSQL) |
| Autenticación | Supabase Auth | Firebase Authentication |
| Almacenamiento | Supabase Storage | Firebase Storage |
| Funciones | Supabase Edge Functions | Cloud Functions |
| Seguridad | RLS Policies | Security Rules |
| Tiempo real | PostgreSQL Realtime | Firestore Realtime |

---

## 📋 Plan de Migración Paso a Paso

### Fase 1: Configuración Inicial de Firebase

#### 1.1 Crear Proyecto Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto
firebase init
```

Seleccionar:
- ✅ Firestore
- ✅ Authentication
- ✅ Storage
- ✅ Functions (opcional)
- ✅ Hosting (opcional)

#### 1.2 Instalar Dependencias

```bash
npm install firebase
npm uninstall @supabase/supabase-js
```

#### 1.3 Configurar Firebase en el Proyecto

Crear `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

Actualizar `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### Fase 2: Migración de Autenticación

#### 2.1 Firebase Authentication

**Supabase actual:**
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Signup
const { data, error } = await supabase.auth.signUp({
  email,
  password
});
```

**Firebase nuevo:**
```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// Login
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Signup
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user;
```

#### 2.2 Actualizar AuthContext

Reemplazar `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userRole: 'proveedor' | 'aprobador' | 'operaciones' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Obtener rol del usuario
        const userDoc = await getDoc(doc(db, 'portal_users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Crear documento de usuario en Firestore
    await setDoc(doc(db, 'portal_users', userCredential.user.uid), {
      user_id: userCredential.user.uid,
      full_name: fullName,
      role: role,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

### Fase 3: Migración de Base de Datos (PostgreSQL → Firestore)

#### 3.1 Diseño de Colecciones Firestore

**IMPORTANTE:** Firestore es NoSQL, por lo que las relaciones SQL deben reestructurarse.

**Modelo Relacional Actual (SQL):**
```
portal_users (1) → (N) suppliers
suppliers (1) → (N) bank_accounts
suppliers (1) → (N) invoices
invoices (1) → (N) deliverable_files
invoices (1) → (N) payments
```

**Modelo NoSQL Propuesto (Firestore):**

```
Colecciones principales:

1. portal_users/{userId}
   - user_id, full_name, role, is_active
   - created_at, updated_at

2. suppliers/{supplierId}
   - portal_user_id (referencia)
   - ruc, business_name, trade_name
   - person_type, country, address, phone, email
   - contact_person, contact_phone, contact_email
   - contracted_service, document_type
   - ruc_file_url, status
   - bank_accounts: Array<BankAccount> (embebido)
   - created_at, updated_at

3. invoices/{invoiceId}
   - supplier_id (referencia)
   - invoice_type, invoice_number, amount, currency
   - has_detraction, detraction_percentage, detraction_amount
   - approver_email, service_performed, deliverables
   - file_url, status, rejection_reason
   - approved_by, approved_at
   - code, budget
   - deliverable_files: Array<File> (embebido)
   - created_at, updated_at

4. payments/{paymentId}
   - invoice_id (referencia)
   - supplier_id (referencia)
   - amount, currency, status
   - payment_method, estimated_payment_date, actual_payment_date
   - bank_account_id, notes, created_by
   - created_at, updated_at

5. company_documents/{documentId}
   - title, document_type, description
   - file_url, target_supplier_id
   - is_public, is_active, uploaded_by
   - created_at, updated_at

6. announcements/{announcementId}
   - title, content, announcement_type
   - target_role, target_supplier_id
   - is_urgent, is_active, scheduled_date
   - created_by
   - attachments: Array<Attachment> (embebido)
   - created_at, updated_at

7. feedback_surveys/{surveyId}
   - supplier_id (referencia)
   - communication_rating, payment_timing_rating
   - platform_usability_rating, overall_satisfaction_rating
   - comments, suggestions
   - created_at, updated_at
```

#### 3.2 Estrategia de Desnormalización

**Ventajas de Firestore:**
- Lecturas rápidas (datos embebidos)
- Escalabilidad horizontal
- Real-time integrado

**Consideraciones:**
- Duplicar datos cuando sea necesario (ej: nombre del proveedor en facturas)
- Usar referencias solo para relaciones 1-a-muchos grandes
- Embeber datos para consultas comunes

**Ejemplo de Factura con Datos Embebidos:**

```typescript
// Estructura de documento en Firestore
{
  id: "invoice_001",
  supplier_id: "supplier_123",
  supplier_data: {
    business_name: "Proveedores SAC",
    ruc: "20123456789",
    email: "contacto@proveedor.com"
  },
  invoice_number: "F001-00001",
  amount: 5000.00,
  currency: "PEN",
  status: "pending",
  deliverable_files: [
    {
      file_name: "factura.pdf",
      file_url: "gs://bucket/path/factura.pdf",
      file_type: "application/pdf",
      file_size: 125000
    }
  ],
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### 3.3 Reglas de Seguridad Firestore

Equivalente a RLS de Supabase, crear `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/portal_users/$(request.auth.uid)).data.role;
    }

    function isProveedor() {
      return isAuthenticated() && getUserRole() == 'proveedor';
    }

    function isAprobador() {
      return isAuthenticated() && getUserRole() == 'aprobador';
    }

    function isOperaciones() {
      return isAuthenticated() && getUserRole() == 'operaciones';
    }

    // Portal Users
    match /portal_users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isOperaciones();
    }

    // Suppliers
    match /suppliers/{supplierId} {
      // Proveedores pueden leer su propia información
      allow read: if isAuthenticated() && (
        resource.data.portal_user_id == request.auth.uid ||
        isAprobador() ||
        isOperaciones()
      );

      // Solo proveedores pueden crear
      allow create: if isProveedor();

      // Proveedores pueden actualizar su información, operaciones todo
      allow update: if isAuthenticated() && (
        resource.data.portal_user_id == request.auth.uid ||
        isOperaciones()
      );

      // Solo operaciones puede eliminar
      allow delete: if isOperaciones();
    }

    // Invoices
    match /invoices/{invoiceId} {
      // Proveedores ven sus facturas, aprobadores las asignadas, operaciones todo
      allow read: if isAuthenticated() && (
        resource.data.supplier_id == request.auth.uid ||
        resource.data.approver_email == request.auth.token.email ||
        isOperaciones()
      );

      // Proveedores crean facturas
      allow create: if isProveedor();

      // Aprobadores aprueban/rechazan, operaciones actualiza todo
      allow update: if isAuthenticated() && (
        (isAprobador() && resource.data.approver_email == request.auth.token.email) ||
        isOperaciones()
      );

      // Solo operaciones elimina
      allow delete: if isOperaciones();
    }

    // Payments
    match /payments/{paymentId} {
      // Todos pueden leer sus pagos
      allow read: if isAuthenticated();

      // Solo operaciones puede crear, actualizar y eliminar
      allow write: if isOperaciones();
    }

    // Company Documents
    match /company_documents/{documentId} {
      // Todos pueden leer documentos públicos o dirigidos a ellos
      allow read: if isAuthenticated() && (
        resource.data.is_public == true ||
        resource.data.target_supplier_id == request.auth.uid ||
        isOperaciones()
      );

      // Solo operaciones puede escribir
      allow write: if isOperaciones();
    }

    // Announcements
    match /announcements/{announcementId} {
      // Todos pueden leer anuncios activos dirigidos a su rol
      allow read: if isAuthenticated() && (
        resource.data.target_role == 'all' ||
        resource.data.target_role == getUserRole() ||
        isOperaciones()
      );

      // Solo operaciones puede escribir
      allow write: if isOperaciones();
    }

    // Feedback Surveys
    match /feedback_surveys/{surveyId} {
      // Proveedores ven sus encuestas, operaciones todas
      allow read: if isAuthenticated() && (
        resource.data.supplier_id == request.auth.uid ||
        isOperaciones()
      );

      // Proveedores crean encuestas
      allow create: if isProveedor();

      // Solo operaciones puede actualizar/eliminar
      allow update, delete: if isOperaciones();
    }
  }
}
```

#### 3.4 Migración de Hooks de Supabase a Firestore

**Ejemplo: useSuppliers Hook**

**Antes (Supabase):**
```typescript
const fetchSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```

**Después (Firestore):**
```typescript
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const fetchSuppliers = async () => {
  const q = query(
    collection(db, 'suppliers'),
    orderBy('created_at', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const createSupplier = async (supplierData) => {
  const docRef = await addDoc(collection(db, 'suppliers'), {
    ...supplierData,
    created_at: new Date(),
    updated_at: new Date()
  });

  return { id: docRef.id, ...supplierData };
};

const updateSupplier = async (supplierId, updates) => {
  const supplierRef = doc(db, 'suppliers', supplierId);
  await updateDoc(supplierRef, {
    ...updates,
    updated_at: new Date()
  });
};
```

#### 3.5 Consultas con Relaciones (JOINs en Firestore)

**Supabase (con JOIN automático):**
```typescript
const { data } = await supabase
  .from('invoices')
  .select(`
    *,
    suppliers(business_name, ruc),
    deliverable_files(*),
    payments(*)
  `);
```

**Firestore (con consultas múltiples):**
```typescript
const fetchInvoicesWithRelations = async () => {
  // 1. Obtener facturas
  const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
  const invoices = invoicesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // 2. Obtener datos relacionados (si no están embebidos)
  for (const invoice of invoices) {
    // Obtener datos del proveedor si es necesario
    if (!invoice.supplier_data) {
      const supplierDoc = await getDoc(doc(db, 'suppliers', invoice.supplier_id));
      invoice.supplier_data = supplierDoc.data();
    }

    // Los deliverable_files ya están embebidos en la factura
    // Los payments se pueden consultar por separado si es necesario
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('invoice_id', '==', invoice.id)
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    invoice.payments = paymentsSnapshot.docs.map(doc => doc.data());
  }

  return invoices;
};
```

**Alternativa con datos embebidos (recomendado):**
```typescript
// Al crear la factura, embeber datos del proveedor
const createInvoice = async (invoiceData, supplierId) => {
  // Obtener datos del proveedor
  const supplierDoc = await getDoc(doc(db, 'suppliers', supplierId));
  const supplierData = supplierDoc.data();

  // Crear factura con datos embebidos
  await addDoc(collection(db, 'invoices'), {
    ...invoiceData,
    supplier_id: supplierId,
    supplier_data: {
      business_name: supplierData.business_name,
      ruc: supplierData.ruc,
      email: supplierData.email
    },
    deliverable_files: invoiceData.files || [],
    created_at: new Date(),
    updated_at: new Date()
  });
};
```

#### 3.6 Reemplazo de Vistas (Views)

Las vistas SQL deben convertirse en **Cloud Functions** o **consultas agregadas**:

**Vista actual: `vw_supplier_dashboard`**
```sql
SELECT
  s.id,
  s.business_name,
  COUNT(i.id) as total_invoices,
  SUM(CASE WHEN i.status = 'approved' THEN 1 ELSE 0 END) as approved_invoices,
  SUM(CASE WHEN i.status = 'pending' THEN 1 ELSE 0 END) as pending_invoices
FROM suppliers s
LEFT JOIN invoices i ON i.supplier_id = s.id
GROUP BY s.id;
```

**Equivalente en Cloud Function:**
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const getSupplierDashboard = functions.https.onCall(async (data, context) => {
  const supplierId = data.supplierId;

  // Obtener datos del proveedor
  const supplierDoc = await db.collection('suppliers').doc(supplierId).get();
  const supplier = supplierDoc.data();

  // Obtener facturas del proveedor
  const invoicesSnapshot = await db
    .collection('invoices')
    .where('supplier_id', '==', supplierId)
    .get();

  const invoices = invoicesSnapshot.docs.map(doc => doc.data());

  // Calcular estadísticas
  const stats = {
    supplier_id: supplierId,
    business_name: supplier?.business_name,
    total_invoices: invoices.length,
    approved_invoices: invoices.filter(i => i.status === 'approved').length,
    pending_invoices: invoices.filter(i => i.status === 'pending').length,
    rejected_invoices: invoices.filter(i => i.status === 'rejected').length,
    total_paid_amount: invoices
      .filter(i => i.status === 'approved')
      .reduce((sum, i) => sum + i.amount, 0)
  };

  return stats;
});
```

**Alternativa: Agregación en Cliente (más simple):**
```typescript
// src/hooks/useDashboard.ts
const fetchSupplierStats = async (supplierId: string) => {
  // Obtener proveedor
  const supplierDoc = await getDoc(doc(db, 'suppliers', supplierId));
  const supplier = supplierDoc.data();

  // Obtener facturas
  const q = query(
    collection(db, 'invoices'),
    where('supplier_id', '==', supplierId)
  );
  const invoicesSnapshot = await getDocs(q);
  const invoices = invoicesSnapshot.docs.map(doc => doc.data());

  // Calcular estadísticas
  return {
    supplier_id: supplierId,
    business_name: supplier?.business_name,
    total_invoices: invoices.length,
    approved_invoices: invoices.filter(i => i.status === 'approved').length,
    pending_invoices: invoices.filter(i => i.status === 'pending').length,
    rejected_invoices: invoices.filter(i => i.status === 'rejected').length,
    total_paid_amount: invoices
      .filter(i => i.status === 'approved')
      .reduce((sum, i) => sum + (i.amount || 0), 0)
  };
};
```

---

### Fase 4: Migración de Almacenamiento (Storage)

#### 4.1 Firebase Storage

**Supabase actual:**
```typescript
const { data, error } = await supabase.storage
  .from('documentos')
  .upload(fullPath, file);

const { data: publicURL } = supabase.storage
  .from('documentos')
  .getPublicUrl(fullPath);
```

**Firebase nuevo:**
```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

// Upload file
const uploadFile = async (file: File, folderPath: string, userId: string) => {
  const timestamp = Date.now();
  const fileName = file.name;
  const fullPath = `${folderPath}/${userId}/${timestamp}-${fileName}`;

  const storageRef = ref(storage, fullPath);
  const snapshot = await uploadBytes(storageRef, file);

  // Obtener URL de descarga
  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    path: fullPath,
    url: downloadURL
  };
};

// Delete file
const deleteFile = async (filePath: string) => {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
};

// Get file URL
const getFileURL = async (filePath: string) => {
  const storageRef = ref(storage, filePath);
  return await getDownloadURL(storageRef);
};
```

#### 4.2 Reglas de Seguridad Storage

Crear `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return firestore.get(/databases/(default)/documents/portal_users/$(request.auth.uid)).data.role;
    }

    function isProveedor() {
      return isAuthenticated() && getUserRole() == 'proveedor';
    }

    function isAprobador() {
      return isAuthenticated() && getUserRole() == 'aprobador';
    }

    function isOperaciones() {
      return isAuthenticated() && getUserRole() == 'operaciones';
    }

    // Carpeta de proveedores
    match /proveedor/{userId}/{allPaths=**} {
      // Proveedores: acceso completo a su carpeta
      allow read, write: if isAuthenticated() && request.auth.uid == userId;

      // Aprobadores y operaciones: solo lectura
      allow read: if isAprobador() || isOperaciones();
    }

    // Carpeta de aprobadores
    match /aprobador/{allPaths=**} {
      allow read: if isAprobador() || isOperaciones();
      allow write: if isAprobador();
    }

    // Carpeta de operaciones
    match /operaciones/{allPaths=**} {
      allow read, write: if isOperaciones();
    }

    // Documentos de la empresa (públicos)
    match /company_documents/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOperaciones();
    }
  }
}
```

#### 4.3 Servicio de Storage Actualizado

Reemplazar `src/lib/storage.ts`:

```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase';

export class FirebaseStorageService {
  /**
   * Sube un archivo a Firebase Storage
   */
  static async uploadFile(
    file: File,
    folderPath: string,
    userId: string
  ): Promise<{ path: string; url: string }> {
    const timestamp = Date.now();
    const fileName = file.name;
    const fullPath = `${folderPath}/${userId}/${timestamp}-${fileName}`;

    const storageRef = ref(storage, fullPath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      path: fullPath,
      url: downloadURL
    };
  }

  /**
   * Sube múltiples archivos
   */
  static async uploadMultipleFiles(
    files: File[],
    folderPath: string,
    userId: string
  ): Promise<Array<{ path: string; url: string; fileName: string }>> {
    const uploadPromises = files.map(async (file) => {
      const result = await this.uploadFile(file, folderPath, userId);
      return {
        ...result,
        fileName: file.name
      };
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Elimina un archivo
   */
  static async deleteFile(filePath: string): Promise<void> {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  static async getPublicUrl(filePath: string): Promise<string> {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  }

  /**
   * Lista archivos en una carpeta
   */
  static async listFiles(folderPath: string): Promise<string[]> {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    return result.items.map(item => item.fullPath);
  }
}
```

---

### Fase 5: Funcionalidades en Tiempo Real

#### 5.1 Real-time con Firestore

Una ventaja de Firebase es el soporte nativo de tiempo real:

```typescript
import { onSnapshot, collection, query, where } from 'firebase/firestore';

// Escuchar cambios en facturas pendientes
const listenToPendingInvoices = (callback: (invoices: Invoice[]) => void) => {
  const q = query(
    collection(db, 'invoices'),
    where('status', '==', 'pending')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(invoices);
  });

  return unsubscribe; // Llamar para detener la escucha
};

// Uso en componente React
useEffect(() => {
  const unsubscribe = listenToPendingInvoices((invoices) => {
    setInvoices(invoices);
  });

  return () => unsubscribe();
}, []);
```

---

### Fase 6: Cloud Functions (Opcional)

#### 6.1 Crear Cloud Functions

```bash
firebase init functions
cd functions
npm install
```

#### 6.2 Funciones Útiles

**Función para crear pago automático al aprobar factura:**

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const onInvoiceApproved = functions.firestore
  .document('invoices/{invoiceId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Si la factura cambió de pending a approved
    if (before.status === 'pending' && after.status === 'approved') {
      const invoiceId = context.params.invoiceId;

      // Crear registro de pago
      await db.collection('payments').add({
        invoice_id: invoiceId,
        supplier_id: after.supplier_id,
        amount: after.amount,
        currency: after.currency,
        status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Enviar notificación (opcional)
      // await sendNotification(after.supplier_id, 'Invoice approved');
    }
  });

export const onSupplierCreated = functions.firestore
  .document('suppliers/{supplierId}')
  .onCreate(async (snap, context) => {
    const supplier = snap.data();

    // Notificar a operaciones sobre nuevo proveedor
    await db.collection('notifications').add({
      type: 'new_supplier',
      supplier_id: context.params.supplierId,
      supplier_name: supplier.business_name,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });
  });

// Función HTTP para obtener estadísticas
export const getStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await db.collection('portal_users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole === 'operaciones') {
    // Estadísticas globales
    const invoicesSnapshot = await db.collection('invoices').get();
    const suppliersSnapshot = await db.collection('suppliers').get();

    return {
      total_suppliers: suppliersSnapshot.size,
      total_invoices: invoicesSnapshot.size,
      pending_invoices: invoicesSnapshot.docs.filter(d => d.data().status === 'pending').length,
      approved_invoices: invoicesSnapshot.docs.filter(d => d.data().status === 'approved').length
    };
  } else if (userRole === 'proveedor') {
    // Estadísticas del proveedor
    const supplierDoc = await db.collection('suppliers')
      .where('portal_user_id', '==', context.auth.uid)
      .get();

    if (supplierDoc.empty) {
      return { error: 'Supplier not found' };
    }

    const supplierId = supplierDoc.docs[0].id;
    const invoicesSnapshot = await db.collection('invoices')
      .where('supplier_id', '==', supplierId)
      .get();

    return {
      total_invoices: invoicesSnapshot.size,
      pending_invoices: invoicesSnapshot.docs.filter(d => d.data().status === 'pending').length,
      approved_invoices: invoicesSnapshot.docs.filter(d => d.data().status === 'approved').length
    };
  }

  throw new functions.https.HttpsError('permission-denied', 'Invalid role');
});
```

**Desplegar funciones:**
```bash
firebase deploy --only functions
```

---

### Fase 7: Migración de Datos

#### 7.1 Script de Migración

Crear `scripts/migrate-to-firebase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import serviceAccount from './firebase-service-account.json';

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db = admin.firestore();

async function migrateSuppliers() {
  console.log('Migrando proveedores...');

  const { data: suppliers, error } = await supabase
    .from('suppliers')
    .select('*');

  if (error) {
    console.error('Error obteniendo proveedores:', error);
    return;
  }

  const batch = db.batch();

  for (const supplier of suppliers!) {
    const docRef = db.collection('suppliers').doc(supplier.id);
    batch.set(docRef, {
      ...supplier,
      created_at: admin.firestore.Timestamp.fromDate(new Date(supplier.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(supplier.updated_at))
    });
  }

  await batch.commit();
  console.log(`✅ ${suppliers!.length} proveedores migrados`);
}

async function migrateInvoices() {
  console.log('Migrando facturas...');

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      suppliers (business_name, ruc, email),
      deliverable_files (*)
    `);

  if (error) {
    console.error('Error obteniendo facturas:', error);
    return;
  }

  const batch = db.batch();

  for (const invoice of invoices!) {
    const docRef = db.collection('invoices').doc(invoice.id);

    batch.set(docRef, {
      ...invoice,
      supplier_data: {
        business_name: invoice.suppliers?.business_name,
        ruc: invoice.suppliers?.ruc,
        email: invoice.suppliers?.email
      },
      deliverable_files: invoice.deliverable_files || [],
      created_at: admin.firestore.Timestamp.fromDate(new Date(invoice.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(invoice.updated_at))
    });
  }

  await batch.commit();
  console.log(`✅ ${invoices!.length} facturas migradas`);
}

async function migratePayments() {
  console.log('Migrando pagos...');

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*');

  if (error) {
    console.error('Error obteniendo pagos:', error);
    return;
  }

  const batch = db.batch();

  for (const payment of payments!) {
    const docRef = db.collection('payments').doc(payment.id);
    batch.set(docRef, {
      ...payment,
      created_at: admin.firestore.Timestamp.fromDate(new Date(payment.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(payment.updated_at))
    });
  }

  await batch.commit();
  console.log(`✅ ${payments!.length} pagos migrados`);
}

async function main() {
  console.log('🚀 Iniciando migración a Firebase...\n');

  try {
    await migrateSuppliers();
    await migrateInvoices();
    await migratePayments();
    // Agregar más funciones de migración según sea necesario

    console.log('\n✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

main();
```

**Ejecutar migración:**
```bash
ts-node scripts/migrate-to-firebase.ts
```

---

## 📊 Comparación de Costos

### Supabase (Actual)

**Free Tier:**
- 500 MB de base de datos
- 1 GB de almacenamiento
- 2 GB de transferencia
- 50,000 usuarios activos mensuales

**Paid Tier (Pro: $25/mes):**
- 8 GB de base de datos
- 100 GB de almacenamiento
- 50 GB de transferencia

### Firebase (Propuesto)

**Free Tier (Spark Plan):**
- 1 GB de almacenamiento Firestore
- 10 GB de transferencia Firestore
- 1 GB de almacenamiento Storage
- 5 GB de transferencia Storage
- Autenticación ilimitada

**Paid Tier (Blaze - Pay as you go):**
- $0.18/GB almacenamiento Firestore
- $0.10/GB descarga Storage
- $0.026/GB descarga Firestore
- Autenticación gratis

**Estimación para este proyecto:**
- Supabase: $25/mes (Plan Pro)
- Firebase: $5-15/mes (dependiendo del uso)

---

## 🎯 Resumen de Ventajas y Desventajas

### Supabase (Actual)

**Ventajas:**
✅ PostgreSQL (SQL familiar)
✅ Relaciones y JOINs automáticos
✅ Vistas materializadas
✅ RLS integrado
✅ Migración más fácil a PostgreSQL tradicional

**Desventajas:**
❌ Menos escalable que Firestore
❌ Real-time limitado
❌ Menos integraciones
❌ Ecosistema más pequeño

### Firebase (Propuesto)

**Ventajas:**
✅ Escalabilidad masiva
✅ Real-time nativo
✅ Ecosistema Google (Analytics, ML, etc.)
✅ Más económico en escala pequeña
✅ Cloud Functions integradas
✅ Mejor documentación y comunidad

**Desventajas:**
❌ NoSQL (requiere cambio de mentalidad)
❌ Sin JOINs nativos (requiere desnormalización)
❌ Vendor lock-in más fuerte
❌ Curva de aprendizaje para Security Rules

---

## 🚀 Plan de Implementación Recomendado

### Opción A: Migración Completa (4-6 semanas)

1. **Semana 1-2**: Configuración de Firebase + Autenticación
2. **Semana 3-4**: Migración de datos y esquemas
3. **Semana 5**: Migración de Storage y funciones
4. **Semana 6**: Testing y despliegue

### Opción B: Migración Gradual (8-12 semanas)

1. **Fase 1**: Mantener Supabase, agregar Firebase Auth
2. **Fase 2**: Migrar almacenamiento a Firebase Storage
3. **Fase 3**: Migrar colecciones no críticas
4. **Fase 4**: Migrar colecciones críticas
5. **Fase 5**: Desactivar Supabase

### Opción C: Arquitectura Híbrida

- Mantener Supabase para datos críticos
- Usar Firebase para autenticación y storage
- Usar Cloud Functions para lógica compleja

---

## 📝 Checklist de Migración

### Pre-migración
- [ ] Backup completo de base de datos Supabase
- [ ] Crear proyecto Firebase
- [ ] Configurar facturación
- [ ] Instalar Firebase CLI
- [ ] Descargar service account key

### Autenticación
- [ ] Implementar Firebase Auth
- [ ] Migrar usuarios existentes
- [ ] Actualizar AuthContext
- [ ] Testing de login/signup
- [ ] Configurar roles y claims

### Base de Datos
- [ ] Diseñar colecciones Firestore
- [ ] Escribir Security Rules
- [ ] Implementar hooks actualizados
- [ ] Migrar datos de producción
- [ ] Verificar integridad de datos

### Storage
- [ ] Configurar Firebase Storage
- [ ] Escribir Storage Rules
- [ ] Migrar archivos existentes
- [ ] Actualizar servicio de storage
- [ ] Testing de uploads/downloads

### Funciones
- [ ] Crear Cloud Functions
- [ ] Implementar lógica de negocio
- [ ] Desplegar funciones
- [ ] Testing de funciones

### Testing
- [ ] Testing de integración
- [ ] Testing de seguridad
- [ ] Testing de performance
- [ ] UAT (User Acceptance Testing)

### Despliegue
- [ ] Configurar CI/CD
- [ ] Despliegue a staging
- [ ] Despliegue a producción
- [ ] Monitoreo post-despliegue
- [ ] Rollback plan

---

## 🔧 Herramientas Útiles

1. **Firebase CLI**: `npm install -g firebase-tools`
2. **Firebase Admin SDK**: Para scripts de migración
3. **Firestore Rules Testing**: `firebase emulators:start`
4. **Firebase Extensions**: Para funcionalidades pre-construidas

---

## 📚 Recursos Adicionales

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Migration Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## 💡 Recomendación Final

Para este proyecto específico (**Portal Proveedores**), recomiendo:

### ✅ MANTENER SUPABASE si:
- El equipo está cómodo con SQL
- No se requiere escalabilidad masiva inmediata
- El presupuesto es limitado ($25/mes fijo)
- Se planea migrar a PostgreSQL auto-hospedado

### ✅ MIGRAR A FIREBASE si:
- Se requiere escalabilidad global
- Se quiere real-time nativo
- Se busca integración con otros servicios Google
- El costo variable es aceptable
- Se valora el ecosistema más amplio

**Mi recomendación personal**: Mantener Supabase a menos que haya una necesidad específica de las funcionalidades de Firebase. Supabase es más sencillo para este caso de uso y el equipo ya está familiarizado con él.

---

*Documento generado: 2025-11-05*
*Versión: 1.0*
