"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ReportesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente a reportes descargables
    router.push("/reportes/descargables")
  }, [router])

  return null
}
