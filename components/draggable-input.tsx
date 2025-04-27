"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useDrag, useDrop } from "react-dnd"

interface DraggableInputProps {
  id: string
  label?: string
  onLabelChange?: (id: string, newLabel: string) => void
  index: number
  moveInput: (dragIndex: number, hoverIndex: number) => void
  onDelete: (id: string) => void
  input: {
    type?: string
    mask?: string
    placeholder?: string
  }
  value: string
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// Modificar a função getDefaultLabel para retornar um label mais descritivo
const getDefaultLabel = () => {
  return "Campo"
}

// Adicione esta função para determinar o placeholder com base no tipo/máscara
function getPlaceholder(input: { type?: string; mask?: string; placeholder?: string }) {
  if (input.type === "email") {
    return "email@exemplo.com"
  } else if (input.mask === "(99) 99999-9999" || input.mask === "(99) 9999-9999") {
    return "(00) 00000-0000"
  } else if (input.mask === "99/99/9999") {
    return "dd/mm/aaaa"
  } else if (input.mask === "999.999.999-99") {
    return "000.000.000-00"
  } else if (input.mask === "99.999.999/9999-99") {
    return "00.000.000/0000-00"
  } else if (input.mask === "99999-999") {
    return "00000-000"
  }
  return input.placeholder || "Insira sua resposta aqui"
}

const DraggableInput: React.FC<DraggableInputProps> = ({
  id,
  label = getDefaultLabel(),
  onLabelChange,
  index,
  moveInput,
  onDelete,
  input,
  value,
  handleChange,
}) => {
  const [inputLabel, setInputLabel] = useState(label)
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop({
    accept: "input",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      moveInput(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: "input",
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  useEffect(() => {
    setInputLabel(label)
  }, [label])

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Não permitir a edição do placeholder diretamente no input
    // Em vez disso, o placeholder só deve ser editável no painel de configuração

    // Manter o código existente para atualizar o valor do input
    const newLabel = e.target.value
    setInputLabel(newLabel)
    if (onLabelChange) {
      onLabelChange(id, newLabel)
    }
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "5px",
        backgroundColor: "white",
      }}
    >
      <label htmlFor={`input-${id}`}>{getDefaultLabel()}:</label>
      {/* Certifique-se de usar o tipo correto do input */}
      {/* Substitua qualquer renderização de input por: */}
      <input
        type={input.type || "text"}
        id={`input-${id}`}
        value={value}
        placeholder={getPlaceholder(input)}
        className="w-full outline-none"
        onChange={handleChange}
      />
      {/* Adicione mensagem de ajuda para o formato */}
      {(input.type === "email" || input.mask) && (
        <div className="text-xs text-gray-500 mt-1">
          {input.type === "email" && "Formato de email válido: exemplo@dominio.com"}
          {input.mask && `Formato esperado: ${input.mask}`}
        </div>
      )}
      <button onClick={() => onDelete(id)}>Excluir</button>
    </div>
  )
}

export default DraggableInput
