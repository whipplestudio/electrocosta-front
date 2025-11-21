"use client"

import { useState } from "react"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface DocumentUploaderProps {
  tipoDocumento: string
  entidadTipo?: string
  entidadId?: string
  categoria?: string
  onSuccess?: (documento: any) => void
  onCancel?: () => void
}

export function DocumentUploader({
  tipoDocumento,
  entidadTipo,
  entidadId,
  categoria,
  onSuccess,
  onCancel,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [descripcion, setDescripcion] = useState("")
  const [tags, setTags] = useState("")
  const [categoriaLocal, setCategoriaLocal] = useState(categoria || "operativo")
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validar tamaño (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("El archivo no puede ser mayor a 10MB")
        return
      }
      
      // Validar tipo
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Tipo de archivo no permitido. Solo PDF e imágenes (JPG, PNG, WEBP)")
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecciona un archivo")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipoDocumento", tipoDocumento)
      formData.append("categoria", categoriaLocal)
      formData.append("descripcion", descripcion)
      formData.append("tags", tags)
      
      if (entidadTipo) formData.append("entidadTipo", entidadTipo)
      if (entidadId) formData.append("entidadId", entidadId)
      formData.append("esPublico", "false")

      const response = await fetch("http://localhost:3001/api/v1/documentos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al subir documento")
      }

      const documento = await response.json()
      toast.success("Documento subido exitosamente")
      
      if (onSuccess) {
        onSuccess(documento)
      }
      
      // Reset form
      setFile(null)
      setDescripcion("")
      setTags("")
    } catch (error: any) {
      console.error("Error uploading document:", error)
      toast.error(error.message || "Error al subir documento")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click para seleccionar archivo
            </span>
            <span className="text-xs text-gray-400 mt-1">
              PDF, JPG, PNG, WEBP (máx. 10MB)
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {file && (
        <>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoriaLocal} onValueChange={setCategoriaLocal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operativo">Operativo</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="financiero">Financiero</SelectItem>
                <SelectItem value="ventas">Ventas</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del documento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (separados por comas)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pago, noviembre, proveedor-abc"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={uploading}>
                Cancelar
              </Button>
            )}
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subir Documento
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
