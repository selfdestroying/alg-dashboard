import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import React from 'react'

export interface TableFilterItem {
  label: string
  value: string
}

interface TableFilterProps {
  label: string
  items: TableFilterItem[]
  defaultValue?: TableFilterItem[]
  disabled?: boolean
  onChange?: (selectedCourses: TableFilterItem[]) => void
}

export default function TableFilter({
  label,
  items,
  defaultValue,
  disabled,
  onChange,
}: TableFilterProps) {
  const anchor = useComboboxAnchor()
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Combobox
        multiple
        autoHighlight
        items={items}
        value={defaultValue}
        disabled={disabled}
        onValueChange={(values) => onChange && onChange(values)}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: TableFilterItem[]) => (
              <React.Fragment>
                {values.map((value) => (
                  <ComboboxChip key={value.value}>{value.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: TableFilterItem) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}
