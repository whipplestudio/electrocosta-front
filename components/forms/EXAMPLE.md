# Ejemplo de Uso - DynamicForm

## Ejemplo 1: Formulario Pequeño (2 inputs) - Usar en Login

```tsx
'use client';

import { DynamicForm, FormFieldConfig } from '@/components/forms';
import { toast } from 'sonner';

const loginFields: FormFieldConfig[] = [
  {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    placeholder: 'usuario@electrocosta.com',
    required: true,
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    placeholder: '••••••••',
    required: true,
    minLength: 8,
  },
];

export default function LoginPage() {
  const handleSubmit = async (data: any) => {
    try {
      // Llamar a tu API de login
      await authService.login(data);
      toast.success('Sesión iniciada correctamente');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <DynamicForm
        config={{
          fields: loginFields,
          columns: 1,
          gap: 'medium',
          variant: 'outlined',
        }}
        onSubmit={handleSubmit}
        submitLabel="Iniciar Sesión"
        title="Iniciar Sesión"
        description="Ingresa tus credenciales para acceder al sistema"
      />
    </div>
  );
}
```

## Ejemplo 2: Formulario Grande con Secciones

```tsx
'use client';

import { DynamicForm, FormFieldConfig, FormSection } from '@/components/forms';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Sección: Información Personal
const personalFields: FormFieldConfig[] = [
  {
    name: 'firstName',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Juan',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Apellido',
    type: 'text',
    placeholder: 'Pérez',
    required: true,
  },
  {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    placeholder: 'juan@ejemplo.com',
    required: true,
  },
  {
    name: 'phone',
    label: 'Teléfono',
    type: 'tel',
    placeholder: '+52 999 123 4567',
    pattern: '^[+]?[0-9\\s-]{10,}$',
  },
  {
    name: 'birthDate',
    label: 'Fecha de Nacimiento',
    type: 'date',
  },
];

// Sección: Información Laboral
const workFields: FormFieldConfig[] = [
  {
    name: 'department',
    label: 'Departamento',
    type: 'select',
    placeholder: 'Selecciona un departamento',
    required: true,
    options: [
      { label: 'Ventas', value: 'sales' },
      { label: 'Contabilidad', value: 'accounting' },
      { label: 'Operaciones', value: 'operations' },
      { label: 'TI', value: 'it' },
    ],
  },
  {
    name: 'position',
    label: 'Cargo',
    type: 'text',
    placeholder: 'Ej: Desarrollador Senior',
    required: true,
  },
  {
    name: 'salary',
    label: 'Salario Mensual',
    type: 'currency',
    placeholder: '0.00',
    min: 0,
  },
  {
    name: 'startDate',
    label: 'Fecha de Inicio',
    type: 'date',
    required: true,
  },
  {
    name: 'isActive',
    label: 'Empleado Activo',
    type: 'switch',
    description: 'Marca si el empleado está activo en la empresa',
  },
];

// Sección: Permisos (Multiselect)
const permissionsFields: FormFieldConfig[] = [
  {
    name: 'permissions',
    label: 'Permisos del Sistema',
    type: 'multiselect',
    placeholder: 'Selecciona los permisos',
    options: [
      { label: 'Ver Usuarios', value: 'users.view' },
      { label: 'Crear Usuarios', value: 'users.create' },
      { label: 'Editar Usuarios', value: 'users.edit' },
      { label: 'Eliminar Usuarios', value: 'users.delete' },
      { label: 'Ver Reportes', value: 'reports.view' },
      { label: 'Exportar Reportes', value: 'reports.export' },
    ],
  },
];

const sections: FormSection[] = [
  {
    title: 'Información Personal',
    description: 'Datos básicos del empleado',
    fields: personalFields,
  },
  {
    title: 'Información Laboral',
    description: 'Datos relacionados con su puesto',
    fields: workFields,
  },
  {
    title: 'Permisos',
    fields: permissionsFields,
  },
];

// Para usar en una página
export default function EmployeeFormPage() {
  const handleSubmit = async (data: any) => {
    try {
      await employeesService.create(data);
      toast.success('Empleado creado exitosamente');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <DynamicForm
        config={{
          sections,
          columns: 2,
          gap: 'medium',
          variant: 'outlined',
          density: 'comfortable',
        }}
        onSubmit={handleSubmit}
        submitLabel="Guardar Empleado"
        cancelLabel="Cancelar"
        onCancel={() => router.back()}
        title="Nuevo Empleado"
        description="Completa la información del nuevo empleado"
      />
    </div>
  );
}

// Para usar en un Dialog
export function EmployeeDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      await employeesService.create(data);
      toast.success('Empleado creado exitosamente');
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nuevo Empleado</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DynamicForm
          config={{
            sections,
            columns: 2,
            gap: 'medium',
          }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Crear"
          cancelLabel="Cancelar"
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Ejemplo 3: Campos Condicionales

```tsx
const conditionalFields: FormFieldConfig[] = [
  {
    name: 'userType',
    label: 'Tipo de Usuario',
    type: 'select',
    required: true,
    options: [
      { label: 'Administrador', value: 'admin' },
      { label: 'Cliente', value: 'client' },
    ],
  },
  {
    name: 'companyName',
    label: 'Nombre de la Empresa',
    type: 'text',
    required: true,
    // Solo se muestra si el tipo de usuario es "client"
    visibleWhen: (values) => values.userType === 'client',
  },
  {
    name: 'adminLevel',
    label: 'Nivel de Administrador',
    type: 'select',
    options: [
      { label: 'Super Admin', value: 'super' },
      { label: 'Admin Regular', value: 'regular' },
    ],
    // Solo se muestra si el tipo de usuario es "admin"
    visibleWhen: (values) => values.userType === 'admin',
  },
];
```

## Ejemplo 4: Campos de Número con Validación

```tsx
const numberFields: FormFieldConfig[] = [
  {
    name: 'age',
    label: 'Edad',
    type: 'number',
    min: 18,
    max: 100,
    required: true,
  },
  {
    name: 'price',
    label: 'Precio',
    type: 'currency',
    placeholder: '0.00',
    min: 0,
    step: 0.01,
    required: true,
  },
  {
    name: 'discount',
    label: 'Descuento',
    type: 'percent',
    min: 0,
    max: 100,
    step: 0.5,
  },
];
```

## Ejemplo 5: Usar sin Card (para incrustar en otros componentes)

```tsx
<DynamicForm
  config={{
    fields: simpleFields,
    columns: 2,
    gap: 'small',
  }}
  onSubmit={handleSubmit}
  submitLabel="Guardar"
  // Sin title ni description = sin Card wrapper
/>
```

## Tipos de Campos Disponibles

| Tipo | Descripción | Opciones Especiales |
|------|-------------|---------------------|
| `text` | Input de texto | `minLength`, `maxLength`, `pattern` |
| `email` | Input de email | - |
| `password` | Input de contraseña con toggle | `minLength` |
| `number` | Input numérico | `min`, `max`, `step` |
| `tel` | Input de teléfono | `pattern` |
| `url` | Input de URL | - |
| `textarea` | Área de texto multilínea | `minLength`, `maxLength` |
| `select` | Dropdown simple | `options` |
| `multiselect` | Selección múltiple | `options` |
| `checkbox` | Checkbox individual | - |
| `switch` | Toggle switch | - |
| `date` | Selector de fecha | - |
| `datetime` | Fecha y hora | - |
| `currency` | Input con símbolo $ | `min`, `max`, `step` |
| `percent` | Input con símbolo % | `min`, `max`, `step` |
| `file` | Selector de archivo | `accept`, `multiple` |
| `color` | Selector de color | - |

## Props de Configuración

```tsx
interface FormConfig {
  // Campos sueltos (sin secciones)
  fields?: FormFieldConfig[];
  
  // Secciones agrupadas
  sections?: FormSection[];
  
  // Schema Zod personalizado (opcional)
  schema?: ZodSchema;
  
  // Valores iniciales (opcional)
  defaultValues?: Record<string, any>;
  
  // Variantes de Material Design 3
  variant?: 'filled' | 'outlined' | 'standard'; // default: 'outlined'
  density?: 'compact' | 'comfortable' | 'spacious'; // default: 'comfortable'
  columns?: 1 | 2 | 3 | 4 | 'auto'; // default: 2
  gap?: 'small' | 'medium' | 'large'; // default: 'medium'
}
```

## Props del Componente

```tsx
interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;      // default: 'Guardar'
  cancelLabel?: string;      // default: 'Cancelar'
  loading?: boolean;         // default: false
  className?: string;
  footerClassName?: string;
  showSubmit?: boolean;      // default: true
  showCancel?: boolean;      // default: true
  extraButtons?: React.ReactNode;
  title?: string;            // Si se pasa, se envuelve en Card
  description?: string;      // Si se pasa, se envuelve en Card
}
```
