'use client'

import { GratitudeCategory, CATEGORIES } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  selected: GratitudeCategory | null
  onSelect: (category: GratitudeCategory | null) => void
}

export default function CategoryFilterBar({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-medium transition-all whitespace-nowrap border',
          selected === null
            ? 'bg-brand-primary text-white border-brand-primary'
            : 'bg-white text-brand-text-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
        )}
      >
        All
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-medium transition-all whitespace-nowrap border',
            selected === cat.value
              ? 'bg-brand-primary text-white border-brand-primary'
              : 'bg-white text-brand-text-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
