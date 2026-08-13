type ErrorSummaryProps = {
  errors: readonly { path: string; message: string }[]
  onSelect?: (path: string) => void
}

export function ErrorSummary({ errors, onSelect }: ErrorSummaryProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="error-summary-heading"
      className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-950"
      role="alert"
    >
      <h2 className="font-bold" id="error-summary-heading">
        請修正以下資料
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map(({ path, message }, index) => (
          <li key={`${path}-${index}`}>
            {onSelect ? (
              <button
                className="text-left underline underline-offset-2"
                onClick={() => onSelect(path)}
                type="button"
              >
                {message}
              </button>
            ) : (
              message
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
