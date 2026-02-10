'use client'

import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

import { ProductWithCategory } from '@/src/actions/products'
import DataTable from '@/src/components/data-table'
import { Input } from '@/src/components/ui/input'
import { debounce } from 'es-toolkit'
import { useMemo, useState } from 'react'

import { Category } from '@/prisma/generated/client'
import TableFilter, { TableFilterItem } from '@/src/components/table-filter'
import Image from 'next/image'
import ProductActions from './product-actions'

export default function ProductsTable({
  data,
  categories,
}: {
  data: ProductWithCategory[]
  categories: Category[]
}) {
  const columns: ColumnDef<ProductWithCategory>[] = useMemo(
    () => [
      {
        header: 'Картинка',
        accessorKey: 'image',
        cell: ({ row }) => (
          <div className="relative h-12 w-12 min-w-12 overflow-hidden rounded-lg">
            <Image
              src={row.original.image}
              alt={row.original.name}
              fill
              className="object-cover"
              sizes="50px"
            />
          </div>
        ),
      },
      {
        header: 'Название',
        accessorKey: 'name',
      },
      {
        header: 'Описание',
        accessorKey: 'description',
      },
      {
        header: 'Цена',
        accessorKey: 'price',
      },
      {
        id: 'category',
        header: 'Категория',
        accessorFn: (row) => row.category.name,
        filterFn: (row, id, filterValue) => {
          const categoryName = row.getValue<string>(id).toLowerCase()
          const selectedCategories = (filterValue as string[]).map((value) => value.toLowerCase())
          return selectedCategories.length === 0 || selectedCategories.includes(categoryName)
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <ProductActions product={row.original} categories={categories} />,
      },
    ],
    [categories]
  )
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const [search, setSearch] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const fullName = row.original.name.toLowerCase()
      return fullName.includes(searchValue)
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    state: {
      globalFilter,
      pagination,
      sorting,
    },
  })

  const handleCategoryFilterChange = (selectedCategories: TableFilterItem[]) => {
    const selectedValues = selectedCategories.map((category) => category.label.toLowerCase())
    table.setColumnFilters((prev) => {
      const filtered = prev.filter((filter) => filter.id !== 'category')
      if (selectedValues.length > 0) {
        filtered.push({
          id: 'category',
          value: selectedValues,
        })
      }
      return filtered
    })
  }

  const mappedCategories = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.id.toString() })),
    [categories]
  )

  return (
    <DataTable
      table={table}
      emptyMessage="Нет товаров."
      showPagination
      toolbar={
        <div className="flex flex-col items-end gap-2 md:flex-row">
          <Input
            value={search ?? ''}
            onChange={(e) => {
              setSearch(e.target.value)
              handleSearch(e.target.value)
            }}
            placeholder="Поиск..."
          />
          <TableFilter
            label="Категория"
            items={mappedCategories}
            onChange={handleCategoryFilterChange}
          />
        </div>
      }
    />
  )
}
