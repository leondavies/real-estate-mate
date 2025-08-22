"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X, Edit3 } from "lucide-react"

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
  showCharCount?: boolean
}

export function EditableText({
  value,
  onChange,
  multiline = false,
  placeholder = "Click to edit",
  maxLength,
  className = "",
  showCharCount = false
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      handleCancel()
    }
    if (e.key === "Enter" && e.metaKey && multiline) {
      handleSave()
    }
  }

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input

    return (
      <div className="space-y-2">
        <InputComponent
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${className} ${multiline ? "min-h-[100px]" : ""}`}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
          {showCharCount && maxLength && (
            <span className={`text-sm ${editValue.length > maxLength * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
              {editValue.length}/{maxLength}
            </span>
          )}
        </div>
        {multiline && (
          <p className="text-xs text-gray-500">Press Cmd+Enter to save, Escape to cancel</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={`group cursor-pointer relative p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <div className={`${!value ? "text-gray-400 italic" : ""}`}>
        {value || placeholder}
      </div>
      <Edit3 className="absolute top-2 right-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      {showCharCount && maxLength && value && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  )
}