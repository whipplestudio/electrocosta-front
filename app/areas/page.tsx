'use client'

import { useCallback, useEffect, useState } from "react"
import { Plus, Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { areasService, type Area, type AreaWithProjects } from "@/services/areas.service"

export default function AreasPage() {
  // Estados principales
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Estados de modales
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)

  // Estados de formularios
  const [nuevaArea, setNuevaArea] = useState({
    name: '',
    description: '',
    status: 'active'
  })

  const [areaParaEditar, setAreaParaEditar] = useState<Area | null>(null)
  const [areaSeleccionada, setAreaSeleccionada] = useState<AreaWithProjects | null>(null)
  const [loadingProyectos, setLoadingProyectos] = useState(false)

  // ==================== FUNCIONES PRINCIPALES ====================

  const cargarAreas = useCallback(async () => {
    try {
      setLoading(true)
      const data = await areasService.getAll()
      setAreas(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar áreas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    cargarAreas()
  }, [cargarAreas])

  const crearArea = async () => {
    if (!nuevaArea.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del área es requerido",
        variant: "destructive"
      })
      return
    }

    try {
      await areasService.create(nuevaArea)
      toast({
        title: "Éxito",
        description: "Área creada correctamente"
      })
      setOpenDialog(false)
      setNuevaArea({ name: '', description: '', status: 'active' })
      cargarAreas()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear área",
        variant: "destructive"
      })
    }
  }

  const abrirEditarArea = (area: Area) => {
    setAreaParaEditar(area)
    setOpenEditDialog(true)
  }

  const guardarCambiosArea = async () => {
    if (!areaParaEditar) return

    if (!areaParaEditar.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del área es requerido",
        variant: "destructive"
      })
      return
    }

    try {
      await areasService.update(areaParaEditar.id, {
        name: areaParaEditar.name,
        description: areaParaEditar.description || undefined,
        status: areaParaEditar.status
      })
      toast({
        title: "Éxito",
        description: "Área actualizada correctamente"
      })
      setOpenEditDialog(false)
      setAreaParaEditar(null)
      cargarAreas()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar área",
        variant: "destructive"
      })
    }
  }

  const eliminarArea = async (id: string) => {
    const area = areas.find(a => a.id === id)
    
    if (area && area._count && area._count.proyectos > 0) {
      toast({
        title: "No se puede eliminar",
        description: `Esta área tiene ${area._count.proyectos} proyecto(s) asignado(s)`,
        variant: "destructive"
      })
      return
    }

    if (!confirm('¿Estás seguro de eliminar esta área?')) {
      return
    }

    try {
      await areasService.delete(id)
      toast({
        title: "Éxito",
        description: "Área eliminada correctamente"
      })
      cargarAreas()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar área",
        variant: "destructive"
      })
    }
  }

  const verProyectosArea = async (id: string) => {
    try {
      setLoadingProyectos(true)
      const areaConProyectos = await areasService.getWithProjects(id)
      setAreaSeleccionada(areaConProyectos)
      setOpenViewDialog(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar proyectos del área",
        variant: "destructive"
      })
    } finally {
      setLoadingProyectos(false)
    }
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Áreas</h1>
          <p className="text-muted-foreground">
            Administra las áreas organizacionales de la empresa
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Área
        </Button>
      </div>

      {/* Tabla de áreas */}
      {areas.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay áreas registradas</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera área para comenzar a organizar proyectos
          </p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Área
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Proyectos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {area.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {area._count?.proyectos || 0} proyecto{area._count?.proyectos !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={area.status === 'active' ? 'default' : 'secondary'}>
                      {area.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => verProyectosArea(area.id)}
                        title="Ver proyectos"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => abrirEditarArea(area)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => eliminarArea(area.id)}
                        title="Eliminar"
                        disabled={area._count && area._count.proyectos > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal: Crear Área */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Área</DialogTitle>
            <DialogDescription>
              Registra una nueva área organizacional
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Área *</Label>
              <Input
                placeholder="Ej: Área de Construcción"
                value={nuevaArea.name}
                onChange={(e) => setNuevaArea({...nuevaArea, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción del área..."
                value={nuevaArea.description}
                onChange={(e) => setNuevaArea({...nuevaArea, description: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select
                value={nuevaArea.status}
                onValueChange={(value) => setNuevaArea({...nuevaArea, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={crearArea}>Crear Área</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Área */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Área</DialogTitle>
            <DialogDescription>
              Actualiza la información del área
            </DialogDescription>
          </DialogHeader>
          {areaParaEditar && (
            <div className="space-y-4">
              <div>
                <Label>Nombre del Área *</Label>
                <Input
                  placeholder="Ej: Área de Construcción"
                  value={areaParaEditar.name}
                  onChange={(e) => setAreaParaEditar({...areaParaEditar, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Descripción del área..."
                  value={areaParaEditar.description || ''}
                  onChange={(e) => setAreaParaEditar({...areaParaEditar, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={areaParaEditar.status}
                  onValueChange={(value) => setAreaParaEditar({...areaParaEditar, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarCambiosArea}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Proyectos del Área */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proyectos del Área: {areaSeleccionada?.name}</DialogTitle>
            <DialogDescription>
              Listado de proyectos asignados a esta área
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loadingProyectos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : areaSeleccionada?.proyectos && areaSeleccionada.proyectos.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Presupuesto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areaSeleccionada.proyectos.map((proyecto) => (
                      <TableRow key={proyecto.id}>
                        <TableCell className="font-mono text-sm">
                          {proyecto.codigoProyecto}
                        </TableCell>
                        <TableCell className="font-medium">
                          {proyecto.nombreProyecto}
                        </TableCell>
                        <TableCell>
                          {proyecto.cliente?.name || 'Sin cliente'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {proyecto.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ${proyecto.presupuestoTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay proyectos asignados a esta área</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
