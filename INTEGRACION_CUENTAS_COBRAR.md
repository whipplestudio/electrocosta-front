# 🔗 Integración Frontend-Backend: Cuentas por Cobrar

## ✅ Estado de la Integración

**COMPLETADO** - El módulo de Cuentas por Cobrar ahora está completamente conectado con el backend.

---

## 📁 Archivos Creados

### 1. **Configuración y Cliente HTTP**
```
lib/api-client.ts
```
- Cliente axios configurado
- Interceptores para tokens JWT
- Manejo automático de refresh tokens
- Manejo de errores centralizado

### 2. **Tipos TypeScript**
```
types/accounts-receivable.ts
```
- Interfaces completas sincronizadas con el backend
- Enums para estados, métodos de pago, tipos de seguimiento
- DTOs para requests y responses
- Tipos para reportes y dashboard

### 3. **Servicios API**
```
services/accounts-receivable.service.ts
```
- `accountsReceivableService`: CRUD completo
- `paymentsService`: Registro y consulta de pagos
- `followUpService`: Gestión de seguimientos

### 4. **Hooks Personalizados**
```
hooks/use-accounts-receivable.ts
hooks/use-payments.ts
hooks/use-follow-ups.ts
```
- Manejo de estado
- Carga de datos
- Operaciones CRUD
- Notificaciones con toast

### 5. **Componente Actualizado**
```
app/cuentas-cobrar/page.tsx
```
- Integración completa con hooks
- Estados de carga y error
- Datos reales del backend
- Filtros funcionales

---

## 🚀 Cómo Funciona

### 1. **Configuración Inicial**

Asegúrate de tener el archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 2. **Flujo de Autenticación**

```typescript
// El usuario debe hacer login primero
// Los tokens se guardan automáticamente en localStorage
// El cliente API los incluye en todas las peticiones
```

### 3. **Uso del Hook en Componentes**

```typescript
import { useAccountsReceivable } from '@/hooks/use-accounts-receivable'

function MiComponente() {
  const {
    accounts,        // Array de cuentas
    dashboard,       // Datos del dashboard
    isLoading,       // Estado de carga
    error,           // Mensajes de error
    fetchAccounts,   // Función para cargar cuentas
    createAccount,   // Función para crear cuenta
    // ... más funciones
  } = useAccountsReceivable()

  useEffect(() => {
    fetchAccounts()  // Cargar al montar
  }, [])

  return (
    // ... tu UI
  )
}
```

---

## 📊 Funcionalidades Implementadas

### ✅ Cuentas por Cobrar
- [x] Listar todas las cuentas
- [x] Filtrar por estado, categoría, búsqueda
- [x] Ver dashboard con KPIs
- [x] Estados de carga
- [x] Manejo de errores
- [x] Paginación

### ⏳ Pendiente (Próximos pasos)
- [ ] Crear nueva cuenta (formulario completo)
- [ ] Editar cuenta existente
- [ ] Ver detalles de cuenta
- [ ] Registrar pagos
- [ ] Crear seguimientos
- [ ] Exportar a Excel
- [ ] Reportes de antigüedad

---

## 🎯 Endpoints Conectados

| Funcionalidad | Endpoint | Hook | Estado |
|---------------|----------|------|--------|
| Listar cuentas | `GET /accounts-receivable` | `fetchAccounts()` | ✅ |
| Dashboard | `GET /accounts-receivable/dashboard` | `fetchDashboard()` | ✅ |
| Ver cuenta | `GET /accounts-receivable/:id` | `fetchAccountById()` | ✅ |
| Crear cuenta | `POST /accounts-receivable` | `createAccount()` | ✅ |
| Actualizar | `PATCH /accounts-receivable/:id` | `updateAccount()` | ✅ |
| Eliminar | `DELETE /accounts-receivable/:id` | `deleteAccount()` | ✅ |
| Vencidas | `GET /accounts-receivable/overdue` | `fetchOverdue()` | ✅ |
| Próximas a vencer | `GET /accounts-receivable/upcoming` | `fetchUpcoming()` | ✅ |
| Antigüedad | `GET /accounts-receivable/aging-report` | `fetchAgingReport()` | ✅ |
| Analíticas | `GET /accounts-receivable/analytics` | `fetchAnalytics()` | ✅ |

---

## 🔧 Configuración del Backend

El backend debe estar corriendo en:
```
http://localhost:4000
```

### Verificar Backend
```bash
cd ../Demo-backend
npm run start:dev
```

### Endpoints Disponibles
- API: `http://localhost:4000/api`
- Swagger Docs: `http://localhost:4000/docs`

---

## 🧪 Cómo Probar

### 1. **Iniciar Backend**
```bash
cd Demo-backend
npm run start:dev
```

### 2. **Iniciar Frontend**
```bash
cd Demo-frontend
npm run dev
```

### 3. **Navegar a**
```
http://localhost:3000/cuentas-cobrar
```

### 4. **Login (si es necesario)**
```
Email: admin@Demo.com
Password: Admin123!
```

---

## 📝 Ejemplo de Uso Completo

```typescript
'use client'

import { useEffect } from 'react'
import { useAccountsReceivable } from '@/hooks/use-accounts-receivable'

export default function CuentasCobrarPage() {
  const {
    accounts,
    dashboard,
    isLoading,
    error,
    fetchAccounts,
    fetchDashboard,
    createAccount,
  } = useAccountsReceivable()

  // Cargar datos al montar
  useEffect(() => {
    fetchAccounts()
    fetchDashboard()
  }, [])

  // Crear nueva cuenta
  const handleCreate = async () => {
    const newAccount = await createAccount({
      clientId: 'uuid-cliente',
      invoiceNumber: 'FAC-2024-001',
      amount: 450000,
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
    })
    
    if (newAccount) {
      console.log('Cuenta creada:', newAccount)
    }
  }

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Total por cobrar: ${dashboard?.totalPending}</h1>
      <h2>Cuentas vencidas: {dashboard?.overdueCount}</h2>
      
      <ul>
        {accounts.map(account => (
          <li key={account.id}>
            {account.client?.name} - ${account.balance}
          </li>
        ))}
      </ul>
      
      <button onClick={handleCreate}>Crear Cuenta</button>
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### Error: "Network Error"
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar la URL en `.env.local`
- ✅ Revisar CORS en el backend

### Error: "401 Unauthorized"
- ✅ Hacer login primero
- ✅ Verificar que el token sea válido
- ✅ El token se guarda automáticamente en localStorage

### Error: "Cannot find module"
- ✅ Instalar dependencias: `npm install`
- ✅ Verificar que axios esté instalado

### No se muestran datos
- ✅ Verificar que existan datos en el backend
- ✅ Ejecutar el seed: `npm run db:seed` (en backend)
- ✅ Revisar la consola del navegador

---

## 🎨 Próximas Mejoras

1. **Formularios Completos**
   - Crear cuenta con validación
   - Editar cuenta existente
   - Selección de clientes desde API

2. **Módulo de Pagos**
   - Registrar pagos
   - Ver historial
   - Validar montos

3. **Seguimiento**
   - Crear seguimientos
   - Ver historial
   - Alertas de próximos seguimientos

4. **Reportes**
   - Exportar a Excel
   - PDF de facturas
   - Reporte de antigüedad visual

---

## 📚 Documentación Adicional

- **Backend API**: `/Demo-backend/docs/CUENTAS_POR_COBRAR_API_COMPLETA.json`
- **Tipos TypeScript**: `/types/accounts-receivable.ts`
- **Servicios**: `/services/accounts-receivable.service.ts`

---

**Última actualización**: Noviembre 2024  
**Estado**: ✅ Integración básica completada  
**Próximo paso**: Implementar formularios completos de creación/edición
