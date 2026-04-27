# Spec-Driven Development: Reusable Components Guideline

## Overview

This document defines the standard reusable components for the Electrocosta application. All new features, pages, and components **MUST** use these components to ensure consistency, maintainability, and rapid development.

---

## Component Registry

### 1. ActionButton `@/components/ui/action-button.tsx`

**Purpose:** Standard button component for all user actions.

**Usage:**
```tsx
import { ActionButton, CreateButton, SaveButton, CancelButton } from '@/components/ui';

// Generic usage
<ActionButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</ActionButton>

// Pre-configured buttons
<CreateButton onClick={openModal} />
<SaveButton loading={isSaving} />
<CancelButton onClick={handleCancel} />
```

**Available Variants:**
- `primary` | `secondary` | `danger` | `ghost` | `outline`
- `create` | `save` | `cancel` | `delete` | `edit` | `submit`
- `filter` | `search` | `clear` | `back` | `next` | `upload` | `download` | `refresh` | `close` | `confirm`

**Props:**
- `variant`: ButtonVariant (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (shows spinner)
- `loadingText`: string
- `startIcon` | `endIcon`: ReactNode
- `fullWidth`: boolean

---

### 2. DataTable `@/components/ui/data-table.tsx`

**Purpose:** Standard data table with pagination, filtering, and actions.

**Usage:**
```tsx
import { DataTable, Column, Action, SelectFilter } from '@/components/ui';

// Define columns
const columns: Column<MyData>[] = [
  {
    key: 'name',
    header: 'Nombre',
    render: (row) => <strong>{row.name}</strong>,
  },
  {
    key: 'status',
    header: 'Estado',
    align: 'center',
  },
];

// Define actions
const actions: Action<MyData>[] = [
  {
    label: 'Editar',
    icon: <Edit size={16} />,
    onClick: (row) => handleEdit(row),
  },
  {
    label: 'Eliminar',
    icon: <Trash size={16} />,
    onClick: (row) => handleDelete(row),
    hidden: (row) => row.isDeleted,
  },
];

// Define filters
const selectFilters: SelectFilter[] = [
  {
    key: 'status',
    label: 'Estado',
    options: [
      { value: '', label: 'Todos' },
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
    ],
  },
];

<DataTable
  title="Lista de Items"
  columns={columns}
  data={data}
  keyExtractor={(row) => row.id}
  actions={actions}
  loading={isLoading}
  emptyMessage="No hay datos disponibles"
  
  // Filters
  searchFilter={{ placeholder: 'Buscar...', debounceMs: 400 }}
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  selectFilters={selectFilters}
  filterValues={{ status: filterStatus }}
  onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
  onClearFilters={() => { setSearchQuery(''); setFilters({}); }}
  
  // Pagination (backend-driven)
  pagination={{
    page: currentPage,
    limit: itemsPerPage,
    total: totalItems,
    totalPages: totalPages,
  }}
  onPageChange={setCurrentPage}
  onRowsPerPageChange={setItemsPerPage}
  rowsPerPageOptions={[5, 10, 25, 50]}
/>
```

**Key Features:**
- Backend pagination support
- Debounced search filter
- Select filters (single/multiple)
- Actions menu per row
- Loading skeleton
- Empty state

---

### 3. DynamicForm `@/components/forms/dynamic-form.tsx`

**Purpose:** Auto-generated forms with validation.

**Usage:**
```tsx
import { DynamicForm, FormFieldConfig } from '@/components/forms';

const fields: FormFieldConfig[] = [
  { name: 'firstName', label: 'Nombre', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { 
    name: 'roleId', 
    label: 'Rol', 
    type: 'select', 
    required: true,
    options: roles.map(r => ({ label: r.name, value: r.id })),
  },
  { name: 'active', label: 'Activo', type: 'switch' },
];

<DynamicForm
  config={{
    fields,
    columns: 2, // 1, 2, 3, 4
    gap: 'medium', // 'small' | 'medium' | 'large'
    variant: 'outlined', // 'filled' | 'outlined' | 'standard'
    density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  }}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitLabel="Guardar"
  cancelLabel="Cancelar"
  loading={isSubmitting}
/>
```

**Field Types:**
- `text`, `email`, `tel`, `url`, `password`
- `number`, `currency`, `percent`
- `select` (uses FloatingSelect)
- `multiselect`, `checkbox`, `switch`
- `date`, `datetime`, `color`, `file`, `textarea`

---

### 4. FloatingInput `@/components/ui/floating-input.tsx`

**Purpose:** Input with floating label animation.

**Usage:**
```tsx
import { FloatingInput } from '@/components/ui';

<FloatingInput
  label="Nombre Completo"
  placeholder="Ingresa tu nombre"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errors.name}
  helperText="Este campo es obligatorio"
  startAdornment={<UserIcon />}
  endAdornment={<CheckIcon />}
/>
```

**Features:**
- Label floats up on focus/value
- Error state with red border
- Helper text support
- Start/end adornments

---

### 5. FloatingSelect `@/components/ui/floating-select.tsx`

**Purpose:** Dropdown with floating label animation.

**Usage:**
```tsx
import { FloatingSelect, SelectOption } from '@/components/ui';

const options: SelectOption[] = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2', disabled: true },
];

// Single select
<FloatingSelect
  label="Categoría"
  value={selectedValue}
  onChange={setSelectedValue}
  options={options}
  placeholder="Selecciona una categoría"
/>

// Multi select
<FloatingSelect
  label="Tags"
  value={selectedValues}
  onChange={setSelectedValues}
  options={options}
  multiple
  placeholder="Selecciona tags"
/>
```

**Features:**
- Single and multiple selection
- Chips for multi-select
- Clearable option
- Search/filter (built-in)

---

### 6. FloatingDatePicker `@/components/ui/floating-date-picker.tsx`

**Purpose:** Date picker with floating label and month/year quick navigation.

**Usage:**
```tsx
import { FloatingDatePicker, DateSelection } from '@/components/ui';

// Single date
const [date, setDate] = React.useState<Date | undefined>();

<FloatingDatePicker
  label="Fecha de inicio"
  value={date}
  onChange={setDate}
  mode="single"
  placeholder="Selecciona una fecha"
/>

// Date range
const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>();

<FloatingDatePicker
  label="Rango de fechas"
  value={dateRange}
  onChange={setDateRange}
  mode="range"
  placeholder="Seleccionar rango"
/>
```

**Features:**
- Label flotante (mismo estilo que FloatingInput)
- Selectores de mes y año (navegación rápida)
- Modo single o range
- Botón "Hoy" para fecha actual
- Botón "Aplicar" para confirmar rango
- Clear button para limpiar selección
- Min/max date constraints

---

### 7. KpiCard `@/components/ui/kpi-card.tsx`

**Purpose:** Statistics display cards.

**Usage:**
```tsx
import { 
  KpiCard, 
  TotalKpiCard, 
  IncomeKpiCard, 
  ExpenseKpiCard,
  SuccessKpiCard,
  WarningKpiCard 
} from '@/components/ui';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Pre-configured
<div className="grid gap-4 md:grid-cols-3">
  <TotalKpiCard
    value={stats.total}
    subtitle="Items registrados"
    icon={<Package className="h-4 w-4" />}
  />
  <IncomeKpiCard
    value={stats.income}
    icon={<TrendingUp className="h-4 w-4" />}
  />
  <ExpenseKpiCard
    value={stats.expense}
    icon={<TrendingDown className="h-4 w-4" />}
  />
</div>

// Generic with variants
<KpiCard
  title="Ventas"
  value="$12,450"
  subtitle="+15% vs mes anterior"
  icon={<DollarSign className="h-4 w-4" />}
  variant="success"
  trend={{ value: 15, isPositive: true }}
/>
```

**Available Variants:**
- `default` (gray)
- `primary` (cyan)
- `success` (green)
- `warning` (amber)
- `danger` (red)
- `info` (blue)

----

### 8. FinancialAmountSection `@/components/financial/financial-amount-section.tsx`

**Purpose:** Reusable financial section for calculating totals with IVA (percentage or fixed amount). Used in project forms, accounts payable/receivable.

**Features:**
- Radio selector for IVA type (percentage % or fixed amount $)
- Three columns: Subtotal, IVA, Total
- Automatic formatting with thousand separators
- Calculated total (read-only)
- MD3 styling with floating labels

**Usage:**
```tsx
import { FinancialAmountSection } from '@/components/financial';
import type { IvaType } from '@/components/financial';

// In your component state
const [iva, setIva] = useState('16');
const [ivaType, setIvaType] = useState<IvaType>('percentage');
const [subtotal, setSubtotal] = useState('');
const [total, setTotal] = useState('');

// Handler with calculation
const handleSubtotalChange = (value: string) => {
  const num = parseFloat(value.replace(/,/g, '')) || 0;
  const ivaValue = parseFloat(iva) || 0;
  const ivaAmount = ivaType === 'percentage' 
    ? num * (ivaValue / 100) 
    : ivaValue;
  
  setSubtotal(value);
  setTotal((num + ivaAmount).toString());
};

// In JSX
<FinancialAmountSection
  title="💰 Venta"
  iva={iva}
  ivaType={ivaType}
  subtotal={formatNumber(subtotal)}
  total={formatNumber(total)}
  onIvaChange={setIva}
  onIvaTypeChange={setIvaType}
  onSubtotalChange={handleSubtotalChange}
  subtotalLabel="Subtotal Venta (sin IVA) *"
  totalLabel="Total Venta (con IVA)"
  subtotalError={errors.subtotal}
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | No | Section title (default: "💰 Monto e Impuestos") |
| `iva` | `string` | Yes | IVA value (percentage or amount) |
| `ivaType` | `IvaType` | Yes | 'percentage' or 'amount' |
| `subtotal` | `string` | Yes | Subtotal value (formatted) |
| `total` | `string` | Yes | Total value (calculated) |
| `onIvaChange` | `(value: string) => void` | Yes | IVA value change handler |
| `onIvaTypeChange` | `(type: IvaType) => void` | Yes | IVA type change handler |
| `onSubtotalChange` | `(value: string) => void` | Yes | Subtotal change handler |
| `subtotalLabel` | `string` | No | Label for subtotal input |
| `totalLabel` | `string` | No | Label for total input |
| `subtotalError` | `string` | No | Error message for subtotal |
| `readOnlyTotal` | `boolean` | No | Make total field read-only (default: true) |
| `showRadioSelector` | `boolean` | No | Show IVA type radio selector (default: true) |

---

## Migration Checklist

When migrating or creating a new page/component:

### ✅ Buttons
- [ ] Replace all `<Button>` from shadcn/ui with `<ActionButton>`
- [ ] Use appropriate variant (`create`, `save`, `cancel`, `delete`)
- [ ] Use `loading` prop for async actions

### ✅ Tables
- [ ] Replace manual tables with `<DataTable>`
- [ ] Move filtering logic to backend
- [ ] Implement pagination via API
- [ ] Use `keyExtractor` for unique IDs

### ✅ Forms
- [ ] Replace manual forms with `<DynamicForm>`
- [ ] Define fields array with `FormFieldConfig`
- [ ] Remove manual validation (Zod schema auto-generated)
- [ ] Use `loading` prop during submission

### ✅ Inputs
- [ ] Replace `<Input>` with `<FloatingInput>`
- [ ] Move label to `label` prop (not separate component)
- [ ] Use `error` and `helperText` props for validation messages

### ✅ Selects
- [ ] Replace `<Select>` with `<FloatingSelect>`
- [ ] Define options with `SelectOption` type
- [ ] Use `multiple` prop for multi-select

### ✅ Date Pickers
- [ ] Replace `<Popover>` + `<Calendar>` combos with `<FloatingDatePicker>`
- [ ] Use `mode="single"` for single date selection
- [ ] Use `mode="range"` for date range selection
- [ ] Remove manual month/year navigation (component has built-in selectors)

### ✅ Statistics
- [ ] Replace custom stat cards with `<KpiCard>`
- [ ] Use appropriate variant for context (income=info, expense=danger)
- [ ] Add icons from `lucide-react`

---

## Example: Complete Page Migration

### Before (Inconsistent)
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, ... } from '@/components/ui/table';

export default function OldPage() {
  return (
    <div>
      <h1>Título</h1>
      <Input 
        placeholder="Buscar" 
        value={search} 
        onChange={...} 
      />
      <Button onClick={openModal}>Nuevo</Button>
      <Table>...</Table>
    </div>
  );
}
```

### After (Spec-Driven)
```tsx
import { 
  ActionButton, 
  DataTable, 
  Column, 
  Action, 
  KpiCard 
} from '@/components/ui';

export default function NewPage() {
  const columns: Column<Item>[] = [...];
  const actions: Action<Item>[] = [...];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1>Título</h1>
        <ActionButton variant="create" onClick={openModal}>
          Nuevo Item
        </ActionButton>
      </div>
      
      <KpiCard ... />
      
      <DataTable
        columns={columns}
        actions={actions}
        searchFilter={{ placeholder: 'Buscar items' }}
        pagination={pagination}
        ...
      />
    </div>
  );
}
```

---

## File Locations

| Component | Path |
|-----------|------|
| ActionButton | `@/components/ui/action-button.tsx` |
| DataTable | `@/components/ui/data-table.tsx` |
| FloatingInput | `@/components/ui/floating-input.tsx` |
| FloatingSelect | `@/components/ui/floating-select.tsx` |
| FloatingDatePicker | `@/components/ui/floating-date-picker.tsx` |
| KpiCard | `@/components/ui/kpi-card.tsx` |
| DynamicForm | `@/components/forms/dynamic-form.tsx` |
| DynamicFormField | `@/components/forms/dynamic-form-field.tsx` |
| Form Types | `@/components/forms/form-types.ts` |
| FinancialAmountSection | `@/components/financial/financial-amount-section.tsx` |

**Index Exports:**
- UI Components: `@/components/ui/index.ts`
- Financial Components: `@/components/financial/index.ts`

---

## Design System Tokens

**Colors (from globals.css):**
- Primary: `#164e63` (cyan)
- Background: `#ffffff`
- Foreground: `#374151`
- Border: `#e5e7eb`
- Muted: `#f0fdf4`
- Danger: `#dc2626`
- Success: `#22c55e`

**Border Radius:**
- All components: `rounded-xl` (12px)
- Chips/Badges: `rounded-md` (6px) or `rounded-full`

**Shadows:**
- Cards: `shadow-sm` or `shadow-md`
- Buttons (hover): `hover:shadow-lg`
- Dropdowns: `shadow-lg`

---

## Development Workflow

1. **Identify Components Needed**
   - List all UI elements required for the feature
   - Map to reusable components from this guideline

2. **Check Existing Examples**
   - Reference `@/app/usuarios/page.tsx` for DataTable usage
   - Reference `@/app/categorias/page.tsx` for KpiCards usage
   - Reference forms using `DynamicForm`

3. **Implement with Reusables**
   - Import from `@/components/ui`
   - Follow prop interfaces exactly
   - Use TypeScript types provided

4. **Review Against Guideline**
   - Run through Migration Checklist
   - Ensure consistent styling
   - Verify accessibility

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-XX-XX | Initial guideline with ActionButton, DataTable, DynamicForm, FloatingInput, FloatingSelect, KpiCard |

---

**Questions?** Contact the frontend team or reference existing implementations in:
- `@/app/usuarios/page.tsx` (DataTable + Filters)
- `@/app/categorias/page.tsx` (KpiCards + Tabs)
- Any form using `DynamicForm`
