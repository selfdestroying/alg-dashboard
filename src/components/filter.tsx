import { Label } from '@/components/ui/label'
import { Column } from '@tanstack/react-table'
import { useMemo } from 'react'
import DebouncedInput from './DebouncedInput'

export default function Filter({ column }: { column: Column<any, unknown> }) {
  const { filterVariant } = column.columnDef.meta ?? {}

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = useMemo(
    () =>
      filterVariant === 'range'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
    [column.getFacetedUniqueValues(), filterVariant]
  )

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
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
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
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
          placeholder={`До ${
            column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ''
          }`}
          className="font-lg border-block w-full border p-2 shadow"
        />
      </div>
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      {sortedUniqueValues.map((value) => (
        //dynamically generated select options from faceted values feature
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    <>
      {/* Autocomplete suggestions from faceted values feature */}
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className="w-36 rounded border shadow"
        list={column.id + 'list'}
      />
      <div className="h-1" />
    </>
  )
}
