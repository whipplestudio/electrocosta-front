"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Eye, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Documento {
  id: string
  nombreArchivo: string
  nombreOriginal: string
  tipoMime: string
  tamanioBytes: number
  storageUrl: string
  tipoDocumento: string
  categoria?: string
  descripcion?: string
  tags?: string[]
  createdAt: string
}

interface DocumentViewerProps {
  entidadTipo: string
  entidadId: string
}

export function DocumentViewer({ entidadTipo, entidadId }: DocumentViewerProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string>("")
  const [showViewer, setShowViewer] = useState(false)

  useEffect(() => {
    cargarDocumentos()
  }, [entidadTipo, entidadId])

  const cargarDocumentos = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:3001/api/v1/documentos/entidad/${entidadTipo}/${entidadId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Error al cargar documentos")
      }

      const data = await response.json()
      setDocumentos(data)
    } catch (error: any) {
      console.error("Error loading documents:", error)
      toast.error("Error al cargar documentos")
    } finally {
      setLoading(false)
    }
  }

  const handleVisualizarDocumento = async (doc: Documento) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/documentos/${doc.id}/url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Error al obtener URL")
      }

      const data = await response.json()
      setViewerUrl(data.url)
      setSelectedDoc(doc)
      setShowViewer(true)
    } catch (error: any) {
      console.error("Error getting document URL:", error)
      toast.error("Error al visualizar documento")
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getFileIcon = (tipoMime: string) => {
    if (tipoMime === "application/pdf") return "📄"
    if (tipoMime.startsWith("image/")) return "🖼️"
    return "📎"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No hay documentos adjuntos</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {documentos.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-2xl">{getFileIcon(doc.tipoMime)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.nombreOriginal}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(doc.tamanioBytes)}
                  </span>
                  {doc.categoria && (
                    <Badge variant="secondary" className="text-xs">
                      {doc.categoria}
                    </Badge>
                  )}
                </div>
                {doc.descripcion && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {doc.descripcion}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVisualizarDocumento(doc)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(doc.storageUrl, "_blank")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog para visualizar documento */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDoc?.nombreOriginal}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(viewerUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Abrir en nueva pestaña
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="w-full h-[70vh] overflow-auto">
            {selectedDoc?.tipoMime === "application/pdf" ? (
              <iframe
                src={viewerUrl}
                className="w-full h-full border-0"
                title="Visor de PDF"
              />
            ) : selectedDoc?.tipoMime.startsWith("image/") ? (
              <img
                src={viewerUrl}
                alt={selectedDoc.nombreOriginal}
                className="max-w-full h-auto mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="h-16 w-16 mb-4" />
                <p>No se puede visualizar este tipo de archivo</p>
                <Button
                  className="mt-4"
                  onClick={() => window.open(viewerUrl, "_blank")}
                >
                  Descargar archivo
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
