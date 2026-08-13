type FieldErrorMessageProps = {
  id: string
  message?: string
}

export const invalidFieldClassName = 'border-red-600 ring-1 ring-red-600'

export function FieldErrorMessage({ id, message }: FieldErrorMessageProps) {
  if (!message) return null
  return (
    <p className="text-sm font-semibold text-red-700" id={id} role="alert">
      {message}
    </p>
  )
}
