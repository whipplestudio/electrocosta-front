'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Pencil, Trash2, Tag, Loader2, TrendingUp, TrendingDown, AlertTriangle, Info, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { categoriesService, Category, CategoryType, CreateCategoryDto, UpdateCategoryDto } from '@/services/categories.service';
import { DynamicForm, FormFieldConfig } from '@/components/forms';
import { KpiCard, TotalKpiCard, IncomeKpiCard, ExpenseKpiCard, ActionButton, CreateButton, DataTable, Column, Action } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CategoryType | ''>('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Debounce timer ref
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Flag para evitar doble carga inicial
  const isInitialMount = useRef(true);

  // Función para obtener color según tipo
  const getColorByType = (type: CategoryType): string => {
    return type === 'income' ? '#3B82F6' : '#EF4444';
  };

  // Función para cargar categorías con paginación y filtros
  const loadCategories = useCallback(async (
    search?: string, 
    type?: CategoryType | '', 
    currentPage?: number, 
    currentLimit?: number
  ) => {
    try {
      setLoading(true);
      const response = await categoriesService.getAll({ 
        page: currentPage || page,
        limit: currentLimit || limit,
        type: type || undefined,
        search: search || undefined,
      });
      setCategories(response.data);
      setTotal(response.total);
      setPages(response.totalPages);
    } catch (error) {
      toast.error('Error al cargar categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories(searchTerm, filterType, page, limit);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Handler para paginación
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handler para cambio de límite
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Handler para búsqueda con debounce
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Handler para filtro de tipo
  const handleFilterChange = useCallback((key: string, value: string | string[]) => {
    const typeValue = value as CategoryType | '';
    setFilterType(typeValue);
    setPage(1);
  }, []);

  // Efecto para cargar datos cuando cambian filtros o paginación
  useEffect(() => {
    // Saltar el primer render (ya se carga en el useEffect de montaje)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      loadCategories(searchTerm, filterType, page, limit);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filterType, page, limit]);

  // Configuración de campos del formulario - Color auto-asignado por backend
  const categoryFormFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej: Servicios Profesionales',
      required: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción opcional',
      maxLength: 200,
    },
    {
      name: 'type',
      label: 'Tipo de categoría',
      type: 'select',
      placeholder: 'Selecciona el tipo',
      required: true,
      options: [
        { label: '💰 Ingreso', value: 'income' },
        { label: '💸 Egreso', value: 'expense' },
      ],
      description: 'El color se asignará automáticamente: azul para ingresos, rojo para egresos',
    },
    {
      name: 'macroClasificacion',
      label: 'Clasificación para Dashboard',
      type: 'select',
      placeholder: 'Selecciona clasificación (opcional)',
      description: 'Usada por defecto al crear cuentas por pagar con esta categoría',
      options: [
        { label: 'Sin clasificación', value: 'none' },
        { label: '💎 Materiales', value: 'MATERIALES' },
        { label: '👷 Mano de Obra', value: 'MANO_DE_OBRA' },
        { label: '📦 Otros Gastos', value: 'OTROS' },
      ],
      visibleWhen: (values) => values.type === 'expense',
    },
    // REMOVED: color field - now auto-assigned by backend
  ], []);

  const getDefaultFormValues = () => {
    if (selectedCategory) {
      return {
        name: selectedCategory.name,
        description: selectedCategory.description || '',
        type: selectedCategory.type,
        macroClasificacion: selectedCategory.macroClasificacion || 'none',
        // REMOVED: color - backend handles it
      };
    }
    return {
      name: '',
      description: '',
      type: 'expense',
      macroClasificacion: 'none',
      // REMOVED: color default - backend handles it
    };
  };

  const handleSaveCategory = async (data: Record<string, any>) => {
    try {
      setSubmitting(true);
      
      // Convertir 'none' a undefined para macroClasificacion
      const macroClasificacion = data.macroClasificacion === 'none' ? undefined : data.macroClasificacion;
      
      if (selectedCategory) {
        const updateData: UpdateCategoryDto = {
          name: data.name,
          description: data.description,
          type: data.type as CategoryType,
          macroClasificacion,
          // REMOVED: color - backend auto-assigns based on type
        };
        await categoriesService.update(selectedCategory.id, updateData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        const createData: CreateCategoryDto = {
          name: data.name,
          description: data.description,
          type: data.type as CategoryType,
          macroClasificacion,
          // REMOVED: color - backend auto-assigns based on type
        };
        await categoriesService.create(createData);
        toast.success('Categoría creada exitosamente');
      }
      
      setIsFormModalOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      await categoriesService.delete(selectedCategory.id);
      toast.success('Categoría eliminada exitosamente');
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar categoría. Puede estar en uso.');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const getTypeLabel = (type: CategoryType) => {
    return type === 'income' ? 'Ingreso' : 'Egreso';
  };

  const getTypeBadgeVariant = (type: CategoryType) => {
    return type === 'income' ? 'default' : 'destructive';
  };

  // Estadísticas (se calculan de los datos paginados + info del backend)
  const stats = {
    total: total,
    income: categories.filter((c) => c.type === 'income').length,
    expense: categories.filter((c) => c.type === 'expense').length,
  };

  // DataTable columns configuration
  const categoryColumns: Column<Category>[] = useMemo(() => [
    {
      key: 'color',
      header: 'Color',
      render: (category) => (
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: category.color || '#3B82F6' }}
        />
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (category) => (
        <div className="flex items-center gap-2">
          {category.type === 'income' ? (
            <>
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Ingreso</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Egreso</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (category) => (
        <span className="font-medium text-[#374151]">{category.name}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (category) => (
        category.description ? (
          <span className="text-sm text-[#6b7280] line-clamp-1">
            {category.description}
          </span>
        ) : (
          <span className="text-sm text-[#9ca3af] italic">-</span>
        )
      ),
    },
    {
      key: 'macroClasificacion',
      header: 'Clasificación',
      render: (category) => (
        category.macroClasificacion ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#f0fdf4] text-[#164e63]">
            {category.macroClasificacion === 'MATERIALES' && '💎 Materiales'}
            {category.macroClasificacion === 'MANO_DE_OBRA' && '👷 Mano de Obra'}
            {category.macroClasificacion === 'OTROS' && '📦 Otros'}
          </span>
        ) : (
          <span className="text-sm text-[#9ca3af]">-</span>
        )
      ),
    },
  ], []);

  // DataTable actions configuration
  const categoryActions = useMemo((): Action<Category>[] => [
    {
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (category: Category) => openEditModal(category),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (category: Category) => openDeleteModal(category),
    },
  ], []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Material Design 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#374151]">Categorías</h1>
          <p className="text-[#6b7280]">Gestiona las categorías de ingresos y egresos</p>
        </div>
        <CreateButton onClick={openCreateModal}>
          Nueva Categoría
        </CreateButton>
      </div>

      {/* Estadísticas MD3 */}
      <div className="grid gap-4 md:grid-cols-3">
        <TotalKpiCard
          value={stats.total}
          subtitle="Categorías registradas"
          icon={<Tag className="h-4 w-4" />}
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

      {/* DataTable con paginación, búsqueda y filtros */}
      <DataTable
        title="Listado de Categorías"
        columns={categoryColumns}
        data={categories}
        keyExtractor={(category) => category.id}
        actions={categoryActions}
        loading={loading}
        emptyMessage={searchTerm || filterType 
          ? "No se encontraron categorías con los filtros aplicados" 
          : "No hay categorías registradas. Comienza creando una nueva categoría."}
        
        // Search filter
        searchFilter={{ placeholder: 'Buscar por nombre o descripción...', debounceMs: 400 }}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        
        // Type filter (reemplaza las Tabs)
        selectFilters={[
          {
            key: 'type',
            label: 'Tipo',
            options: [
              { label: 'Todos', value: '' },
              { label: 'Ingreso', value: 'income' },
              { label: 'Egreso', value: 'expense' },
            ],
            placeholder: 'Filtrar por tipo',
          }
        ]}
        filterValues={{ type: filterType }}
        onFilterChange={handleFilterChange}
        
        // Pagination
        pagination={{
          page,
          limit,
          total,
          totalPages: pages,
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Modal Crear/Editar - MD3 Style */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-semibold text-[#374151]">
              {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription className="text-base text-[#6b7280]">
              {selectedCategory ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría para clasificar tus cuentas'}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            id="categoria-form"
            config={{
              fields: categoryFormFields,
              defaultValues: getDefaultFormValues(),
              columns: 1,
              gap: 'medium',
              variant: 'outlined',
              density: 'comfortable',
            }}
            onSubmit={handleSaveCategory}
            loading={submitting}
            showSubmit={false}
            showCancel={false}
            footerClassName="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]"
            extraButtons={
              <>
                <ActionButton variant="ghost" onClick={() => {
                  setIsFormModalOpen(false);
                  setSelectedCategory(null);
                }} disabled={submitting}>
                  Cancelar
                </ActionButton>
                <ActionButton
                  type="submit"
                  form="categoria-form"
                  variant="save"
                  disabled={submitting}
                  startIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {submitting ? 'Guardando...' : (selectedCategory ? 'Guardar Cambios' : 'Crear Categoría')}
                </ActionButton>
              </>
            }
          />
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar - MD3 Style */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader className="pb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 mb-3 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl text-[#374151]">¿Eliminar categoría?</DialogTitle>
            <DialogDescription className="text-[#6b7280]">
              Esta acción no se puede deshacer. Verifica los detalles antes de continuar.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="py-4">
              {/* Preview Card */}
              <div className="rounded-xl overflow-hidden border border-[#e5e7eb]">
                <div 
                  className="h-8 flex items-center px-3"
                  style={{ backgroundColor: selectedCategory.color || '#3B82F6' }}
                />
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-[#374151]">{selectedCategory.name}</h3>
                  {selectedCategory.description && (
                    <p className="text-sm text-[#6b7280] mt-1">{selectedCategory.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      selectedCategory.type === 'income' 
                        ? "bg-blue-50 text-blue-700" 
                        : "bg-red-50 text-red-700"
                    )}>
                      {getTypeLabel(selectedCategory.type)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Warning Message */}
              <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  Si esta categoría está en uso, no podrá ser eliminada.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
            <ActionButton 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)} 
              disabled={submitting}
            >
              Cancelar
            </ActionButton>
            <ActionButton 
              variant="delete" 
              onClick={handleDelete} 
              disabled={submitting}
              startIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            >
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </ActionButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
