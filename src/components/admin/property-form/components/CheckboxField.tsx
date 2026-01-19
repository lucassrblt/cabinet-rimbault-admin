interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        className="sr-only" 
      />
      <div className={`h-4 w-4 rounded border transition-colors flex items-center justify-center ${checked ? 'bg-primary border-primary' : 'border-input hover:border-muted-foreground'}`}>
        {checked && (
          <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-foreground group-hover:text-foreground/80">{label}</span>
    </label>
  )
}

