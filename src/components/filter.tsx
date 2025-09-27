import { Label } from '@/components/ui/label'
import { Column } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DebouncedInput from './debounced-input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export default function Filter<T>({ column }: { column: Column<T, unknown> }) {
  const { filterVariant, allFilterVariants } = column.columnDef.meta ?? {}
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    const v = column.getFilterValue()
    setSelected(typeof v === 'string' ? v : '')
  }, [column.getIsFiltered()])

  const columnFilterValue = column.getFilterValue() as string | [number, number] | undefined

  const facetedValues = column.getFacetedUniqueValues()
  const sortedUniqueValues = useMemo(
    () =>
      filterVariant === 'range'
        ? []
        : allFilterVariants
          ? allFilterVariants.sort()
          : Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
    [facetedValues, filterVariant]
  )

  const handleChange = (value: string) => {
    setSelected(value)
    column.setFilterValue(value)
  }

  const handleClear = () => {
    setSelected('')
    column.setFilterValue(undefined)
  }

  return filterVariant === 'range' ? (
    <div>
      <Label className="text-muted-foreground text-sm font-medium">
        {typeof column.columnDef.header == 'string' ? column.columnDef.header : column.id}
      </Label>
      <div className="flex gap-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          initValue={(columnFilterValue as [number, number])?.[0] ?? ''}
          onDebouncedChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`От ${
            column.getFacetedMinMaxValues()?.[0] !== undefined
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ''
          }`}
          className="font-lg border-block border p-2 shadow"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          initValue={(columnFilterValue as [number, number])?.[1] ?? ''}
          onDebouncedChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`До ${
            column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ''
          }`}
          className="font-lg border-block w-full border p-2 shadow"
        />
      </div>
    </div>
  ) : (
    filterVariant === 'select' && (
      <div>
        <Label className="text-muted-foreground text-sm font-medium">
          {typeof column.columnDef.header == 'string' ? column.columnDef.header : column.id}
        </Label>
        <div className="flex gap-2">
          <Select value={selected} onValueChange={handleChange}>
            <SelectTrigger className="font-lg border-block w-full border p-2 shadow">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              {sortedUniqueValues.map((value) => (
                //dynamically generated select options from faceted values feature
                <SelectItem value={value} key={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {column.getIsFiltered() && (
            <Button variant={'outline'} size={'icon'} onClick={handleClear}>
              <X />
            </Button>
          )}
        </div>
      </div>
    )
  )
}
