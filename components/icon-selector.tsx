"use client"

import { User, Phone, AtSign, CreditCard, Calendar, MapPin, Mail, FileText, Hash } from "lucide-react"

interface IconSelectorProps {
  onSelect: (type: string) => void
  currentType: string
}

export function IconSelector({ onSelect, currentType }: IconSelectorProps) {
  const icons = [
    { type: "text", icon: <User className="w-5 h-5" />, label: "Texto" },
    { type: "phone", icon: <Phone className="w-5 h-5" />, label: "Telefone" },
    { type: "email", icon: <AtSign className="w-5 h-5" />, label: "Email" },
    { type: "card", icon: <CreditCard className="w-5 h-5" />, label: "Cartão" },
    { type: "date", icon: <Calendar className="w-5 h-5" />, label: "Data" },
    { type: "address", icon: <MapPin className="w-5 h-5" />, label: "Endereço" },
    { type: "mail", icon: <Mail className="w-5 h-5" />, label: "Correio" },
    { type: "document", icon: <FileText className="w-5 h-5" />, label: "Documento" },
    { type: "number", icon: <Hash className="w-5 h-5" />, label: "Número" },
  ]

  return (
    <div className="absolute z-10 mt-1 bg-white border border-[#e6e6e6] rounded-md shadow-lg p-2 w-48">
      <div className="grid grid-cols-3 gap-1">
        {icons.map((item) => (
          <div
            key={item.type}
            className={`flex flex-col items-center p-2 rounded cursor-pointer hover:bg-[#f9fafb] ${
              currentType === item.type ? "bg-[#f9fafb] text-[var(--theme-color)]" : "text-[#667085]"
            }`}
            onClick={() => onSelect(item.type)}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
