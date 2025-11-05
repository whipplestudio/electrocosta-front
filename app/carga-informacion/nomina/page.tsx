"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Download, Search, FileText, Calendar, Users } from "lucide-react"

export default function NominaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")

  const nominaData = [
    {
      periodo: "2024-01",
      empleados: 45,
      salariosBrutos: 2850000,
      deducciones: 485000,
      salariosNetos: 2365000,
      cargas: 570000,
      estado: "Procesada",
      fechaProceso: "2024-01-31",
    },
    {
      periodo: "2023-12",
      empleados: 43,
      salariosBrutos: 2750000,
      deducciones: 465000,
      salariosNetos: 2285000,
      cargas: 550000,
      estado: "Pagada",
      fechaProceso: "2023-12-31",
    },
    {
      periodo: "2023-11",
      empleados: 42,
      salariosBrutos: 2680000,
      deducciones: 455000,
      salariosNetos: 2225000,
      cargas: 536000,
      estado: "Pagada",
      fechaProceso: "2023-11-30",
    },
  ]

  const empleadosDetalle = [
    {
      cedula: "1-1234-5678",
      nombre: "Juan Carlos Pérez",
      puesto: "Ingeniero Eléctrico",
      salarioBruto: 850000,
      deducciones: 145000,
      salarioNeto: 705000,
      departamento: "Ingeniería",
    },
    {
      cedula: "2-2345-6789",
      nombre: "María Elena González",
      puesto: "Contadora",
      salarioBruto: 750000,
      deducciones: 128000,
      salarioNeto: 622000,
      departamento: "Administración",
    },
    {
      cedula: "1-3456-7890",
      nombre: "Carlos Alberto Méndez",
      puesto: "Técnico Especialista",
      salarioBruto: 650000,
      deducciones: 110000,
      salarioNeto: 540000,
      departamento: "Operaciones",
    },
  ]

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Procesada":
        return <Badge className="bg-blue-50 text-blue-700">Procesada</Badge>
      case "Pagada":
        return <Badge className="bg-green-50 text-green-700">Pagada</Badge>
      case "Pendiente":
        return <Badge className="bg-yellow-50 text-yellow-700">Pendiente</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Nómina</h1>
          <p className="text-muted-foreground">Gestión de nómina y pagos de empleados</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Plantilla Excel
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Cargar Nómina
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Período actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Salarios Brutos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,850,000</div>
            <p className="text-xs text-muted-foreground">Enero 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Salarios Netos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$2,365,000</div>
            <p className="text-xs text-muted-foreground">Después de deducciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cargas Sociales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$570,000</div>
            <p className="text-xs text-muted-foreground">Patronales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga Masiva de Nómina</CardTitle>
          <CardDescription>Importa datos de nómina desde archivo Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Seleccionar archivo de nómina
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-01">Enero 2024</SelectItem>
                <SelectItem value="2024-02">Febrero 2024</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de nómina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinaria">Ordinaria</SelectItem>
                <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                <SelectItem value="aguinaldo">Aguinaldo</SelectItem>
              </SelectContent>
            </Select>
            <Button>Procesar Nómina</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Nóminas</CardTitle>
            <CardDescription>Períodos procesados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nominaData.map((nomina, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{nomina.periodo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{nomina.empleados} empleados</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${nomina.salariosNetos.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Neto</div>
                  </div>
                  <div>{getStatusBadge(nomina.estado)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalle por Empleado</CardTitle>
            <CardDescription>Nómina actual - Enero 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Salario Bruto</TableHead>
                    <TableHead>Salario Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleadosDetalle.map((empleado) => (
                    <TableRow key={empleado.cedula}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{empleado.nombre}</div>
                          <div className="text-sm text-muted-foreground">{empleado.puesto}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${empleado.salarioBruto.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${empleado.salarioNeto.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
