"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-[#667085] mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} style={{ backgroundColor: "var(--theme-color)" }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
