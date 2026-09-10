import { useEffect, useRef } from "react"
import Icon from "./Icon"

export default function Modal({ title, children, onClose, className = "" }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className={`modal ${className}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose?.()
      }}
    >
      <div className="modal-heading">
        <span className="eyebrow">LABIRIN ANGKA</span>
        {onClose && (
          <button className="icon-button" aria-label="Tutup dialog" onClick={onClose}>
            <Icon name="close" />
          </button>
        )}
      </div>
      <h2>{title}</h2>
      {children}
    </dialog>
  )
}
