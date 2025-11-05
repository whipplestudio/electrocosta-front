"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Plus,
  Edit,
  Eye,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable"
import { AccountReceivable, AccountReceivableStatus } from "@/types/accounts-receivable"

// Helper para mapear estados del backend al frontend
const mapEstado = (status: AccountReceivableStatus): string => {
  switch (status) {
    case AccountReceivableStatus.PENDING:
      return "vigente"
    case AccountReceivableStatus.PARTIAL:
      return "vigente"
    case AccountReceivableStatus.PAID:
      return "pagado"
    case AccountReceivableStatus.OVERDUE:
      return "vencido"
    case AccountReceivableStatus.CANCELLED:
      return "pagado"
    default:
      return "vigente"
  }
}

export default function CuentasCobrarPage() {
  const {
    accounts,
    dashboard,
    isLoading,
    error,
    fetchAccounts,
    fetchDashboard,
    pagination,
  } = useAccountsReceivable()
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<AccountReceivable | null>(null)
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null)
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    amount: '',
    categoryId: '',
    issueDate: null as Date | null,
    dueDate: null as Date | null,
    description: '',
  })

  // Estados para date picker de prueba
  const [dateTest, setDateTest] = useState<Date | null>(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAccounts()
    fetchDashboard()
  }, [fetchAccounts, fetchDashboard])

  // Filtrar cuentas
  const cuentasFiltradas = accounts.filter((cuenta) => {
    const estadoMapeado = mapEstado(cuenta.status)
    const matchEstado = filtroEstado === "todos" || estadoMapeado === filtroEstado
    const matchCategoria = filtroCategoria === "todos" || cuenta.category?.name === filtroCategoria
    const matchBusqueda =
      cuenta.client?.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuenta.invoiceNumber.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchCategoria && matchBusqueda
  })

  // Calcular totales desde el dashboard o desde las cuentas filtradas
  const totalPorCobrar = dashboard?.totalPending || cuentasFiltradas.reduce((sum, cuenta) => sum + Number(cuenta.balance), 0)
  const cuentasVencidas = dashboard?.overdueCount || cuentasFiltradas.filter((c) => mapEstado(c.status) === "vencido").length
  const proximasVencer = cuentasFiltradas.filter((c) => {
    const dueDate = new Date(c.dueDate)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
  }).length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vencido":
        return <Chip label="Vencido" color="error" size="small" />
      case "proximo_vencer":
        return <Chip label="Próximo a Vencer" sx={{ bgcolor: '#fef3c7', color: '#92400e' }} size="small" />
      case "vigente":
        return <Chip label="Vigente" color="success" size="small" />
      case "pagado":
        return <Chip label="Pagado" color="info" size="small" />
      default:
        return <Chip label={estado} color="default" size="small" />
    }
  }

  const handleNuevaCuenta = () => {
    setSelectedCuenta(null)
    // Limpiar formulario
    setFormData({
      clientId: '',
      invoiceNumber: '',
      amount: '',
      categoryId: '',
      issueDate: null,
      dueDate: null,
      description: '',
    })
    setIsDialogOpen(true)
  }

  const handleEditarCuenta = (cuenta: AccountReceivable) => {
    setSelectedCuenta(cuenta)
    // Pre-llenar formulario con datos existentes
    setFormData({
      clientId: cuenta.clientId,
      invoiceNumber: cuenta.invoiceNumber,
      amount: cuenta.amount.toString(),
      categoryId: cuenta.categoryId || '',
      issueDate: new Date(cuenta.issueDate),
      dueDate: new Date(cuenta.dueDate),
      description: cuenta.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmitForm = async () => {
    // Validaciones básicas
    if (!formData.clientId || !formData.invoiceNumber || !formData.amount || !formData.issueDate || !formData.dueDate) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // TODO: Por ahora solo cerramos el dialog
    // En el futuro aquí llamaremos a createAccount() con formData
    console.log('Datos del formulario:', formData)
    toast.info('Funcionalidad de crear cuenta en desarrollo')
    setIsDialogOpen(false)
  }

  const exportarExcel = () => {
    // TODO: Implementar exportación real
    console.log("Exportando cuentas por cobrar a Excel...")
    toast.info('Funcionalidad de exportación en desarrollo')
  }

  // Mostrar loading state
  if (isLoading && accounts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3, bgcolor: '#f9fafb', minHeight: '100vh' }}>
        <Stack spacing={3}>
          {/* Date Picker de Prueba */}
          <Card sx={{ bgcolor: '#fef3c7', borderColor: '#fcd34d', border: 1 }}>
            <CardHeader 
              title={
                <Typography variant="subtitle2">
                  🧪 Prueba de Date Picker
                </Typography>
              }
              subheader={
                <Typography variant="caption" color="text.secondary">
                  Este es un calendario de prueba para verificar que funciona correctamente
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" fontWeight={600}>
                  Selecciona una fecha de prueba
                </Typography>
                <DatePicker
                  value={dateTest}
                  onChange={(newValue) => setDateTest(newValue)}
                  label="Fecha de prueba"
                  slotProps={{
                    textField: { 
                      fullWidth: false,
                      sx: { maxWidth: 300 }
                    }
                  }}
                />
                {dateTest && (
                  <Typography variant="body2" color="success.main" fontWeight={500}>
                    ✅ Fecha seleccionada: {format(dateTest, "PPP", { locale: es })}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Cuentas por Cobrar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las cuentas pendientes de cobro
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportarExcel}
              >
                Exportar Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={handleNuevaCuenta}
              >
                Nueva Cuenta
              </Button>
            </Stack>
          </Box>

          {/* KPIs */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total por Cobrar
                    </Typography>
                    <TrendingUpIcon fontSize="small" color="action" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${totalPorCobrar.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monto pendiente total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Cuentas Vencidas
                    </Typography>
                    <AlertCircleIcon fontSize="small" color="error" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {cuentasVencidas}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Requieren atención inmediata
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Próximas a Vencer
                    </Typography>
                    <ClockIcon fontSize="small" color="warning" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {proximasVencer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vencen en los próximos 7 días
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total Facturas
                    </Typography>
                    <CheckCircleIcon fontSize="small" color="action" />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {cuentasFiltradas.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Facturas en el período
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtros */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <FilterIcon />
                  <Typography variant="h6">Filtros</Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2.4}>
                  <TextField
                    fullWidth
                    label="Buscar"
                    placeholder="Cliente o factura..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2.4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filtroEstado}
                      label="Estado"
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="vencido">Vencido</MenuItem>
                      <MenuItem value="proximo_vencer">Próximo a Vencer</MenuItem>
                      <MenuItem value="vigente">Vigente</MenuItem>
                      <MenuItem value="pagado">Pagado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2.4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={filtroCategoria}
                      label="Categoría"
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                      <MenuItem value="todos">Todas</MenuItem>
                      <MenuItem value="Ventas">Ventas</MenuItem>
                      <MenuItem value="Proyectos">Proyectos</MenuItem>
                      <MenuItem value="Anticipos">Anticipos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2.4}>
                  <DatePicker
                    label="Fecha Desde"
                    value={fechaDesde}
                    onChange={(newValue) => setFechaDesde(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={2.4}>
                  <DatePicker
                    label="Fecha Hasta"
                    value={fechaHasta}
                    onChange={(newValue) => setFechaHasta(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabla de Cuentas */}
          <Card>
            <CardHeader
              title={<Typography variant="h6">Listado de Cuentas por Cobrar</Typography>}
              subheader={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {cuentasFiltradas.length} de {accounts.length} cuentas
                  </Typography>
                  {isLoading && <CircularProgress size={16} />}
                </Box>
              }
            />
            <CardContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Factura</TableCell>
                      <TableCell>Fecha Emisión</TableCell>
                      <TableCell>Fecha Vencimiento</TableCell>
                      <TableCell>Monto Total</TableCell>
                      <TableCell>Saldo Pendiente</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cuentasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No se encontraron cuentas por cobrar
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cuentasFiltradas.map((cuenta) => (
                        <TableRow key={cuenta.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {cuenta.client?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>{cuenta.invoiceNumber}</TableCell>
                          <TableCell>{format(new Date(cuenta.issueDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{format(new Date(cuenta.dueDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell>${Number(cuenta.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              ${Number(cuenta.balance).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>{getEstadoBadge(mapEstado(cuenta.status))}</TableCell>
                          <TableCell>
                            <Chip 
                              label={cuenta.category?.name || 'Sin categoría'} 
                              size="small" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" color="default">
                                <EyeIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEditarCuenta(cuenta)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Dialog para nueva/editar cuenta */}
          <Dialog 
            open={isDialogOpen} 
            onClose={() => setIsDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {selectedCuenta ? "Editar Cuenta por Cobrar" : "Nueva Cuenta por Cobrar"}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedCuenta ? "Modifica los datos de la cuenta" : "Registra una nueva cuenta por cobrar"}
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID del Cliente *"
                      placeholder="UUID del cliente"
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      helperText="Temporalmente ingresa el UUID"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de Factura *"
                      placeholder="FAC-2024-XXX"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Monto Total *"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID Categoría"
                      placeholder="UUID de categoría (opcional)"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Fecha de Emisión *"
                      value={formData.issueDate}
                      onChange={(newValue) => setFormData({...formData, issueDate: newValue})}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Fecha de Vencimiento *"
                      value={formData.dueDate}
                      onChange={(newValue) => setFormData({...formData, dueDate: newValue})}
                      minDate={formData.issueDate || undefined}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Descripción"
                  placeholder="Descripción de la cuenta"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setIsDialogOpen(false)} color="inherit">
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitForm} 
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : null}
              >
                {selectedCuenta ? "Guardar Cambios" : "Crear Cuenta"}
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Box>
    </LocalizationProvider>
  )
}
