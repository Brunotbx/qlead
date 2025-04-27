"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  url: string
  size?: number
}

export default function QRCodeGenerator({ url, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !url) return

    // Importar QRCode dinamicamente para evitar problemas de SSR
    import("qrcode")
      .then((QRCode) => {
        try {
          QRCode.toCanvas(
            canvasRef.current,
            url,
            {
              width: size,
              margin: 2,
            },
            (error) => {
              if (error) console.error("Erro ao gerar QR Code:", error)
            },
          )
        } catch (error) {
          console.error("Erro ao gerar QR Code:", error)
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar biblioteca QRCode:", err)
      })
  }, [url, size])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} />
    </div>
  )
}
