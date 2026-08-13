import { useEffect, useRef } from 'react'

type LeaveConfirmationDialogProps = {
  open: boolean
  onStay: () => void
  onLeave: () => void
}

export function LeaveConfirmationDialog({
  open,
  onStay,
  onLeave,
}: LeaveConfirmationDialogProps) {
  const stayButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      stayButtonRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onStay()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onStay, open])

  if (!open) {
    return null
  }

  return (
    <div
      aria-labelledby="leave-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold" id="leave-dialog-title">
          要離開申請表單嗎？
        </h2>
        <p className="mt-2 text-slate-700">
          尚未送出的資料不會保存，離開後需要重新填寫。
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-bold"
            onClick={onLeave}
            type="button"
          >
            捨棄並離開
          </button>
          <button
            className="min-h-11 rounded-lg bg-blue-800 px-4 py-2 font-bold text-white"
            onClick={onStay}
            ref={stayButtonRef}
            type="button"
          >
            繼續填寫
          </button>
        </div>
      </div>
    </div>
  )
}
