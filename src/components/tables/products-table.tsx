'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'

import { deleteProduct, ProductWithCategory, updateproduct } from '@/actions/products'
import { ProductSchema, ProductSchemaType } from '@/schemas/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { DefaultValues, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import DeleteAction from '../delete-action'
import FormDialog from '../button-dialog'
import DataTable from '../data-table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

const getColumns = (): ColumnDef<ProductWithCategory>[] => [
  {
    header: 'Название',
    accessorKey: 'name',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Описание',
    accessorKey: 'description',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Цена',
    accessorKey: 'price',
    cell: ({ row }) => (
      <div className="space-x-2">
        <span className="text-muted-foreground">{row.original.price}</span>
        {row.original.originalPrice && (
          <span className="text-muted-foreground line-through">{row.original.originalPrice}</span>
        )}
      </div>
    ),
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Картинка',
    accessorKey: 'image',
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/uploads/${row.original.image}`}>{row.original.image}</Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Категория',
    accessorFn: (row) => row.category.name,
    meta: {
      filterVariant: 'select',
    },
  },
  {
    id: 'actions',
    header: 'Действия',
    cell: ({ row }) => (
      <div className="space-x-2">
        <DeleteAction
          id={row.original.id}
          action={deleteProduct}
          confirmationText={row.original.name}
        />
        <FormDialog
          FormComponent={EditAction}
          formComponentProps={{
            product: row.original,
            defaultValues: {
              name: row.original.name,
              description: row.original.description ?? undefined,
              price: row.original.price,
              quantity: row.original.quantity,
              categoryId: row.original.categoryId,
            },
          }}
          title="Редактровать"
          icon={Edit}
          triggerButtonProps={{
            size: 'icon',
            variant: 'ghost',
          }}
          submitButtonProps={{
            form: 'update-product-form',
          }}
        />
      </div>
    ),
    enableHiding: false,
  },
]

export default function ProductsTable({ products }: { products: ProductWithCategory[] }) {
  const columns = getColumns()
  return <DataTable data={products} columns={columns} paginate />
}

function EditAction({
  product,
  defaultValues,
}: {
  product: ProductWithCategory
  defaultValues: DefaultValues<ProductSchemaType>
}) {
  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(ProductSchema),
    defaultValues,
  })

  const handleSubmit = (values: ProductSchemaType) => {
    const ok = updateproduct({
      where: {
        id: product.id,
      },
      data: {
        name: values.name,
        description: values.description,
        price: values.price,
        quantity: values.quantity,
      },
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Товар успешно обновлен',
      error: (e) => e.message,
    })
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="update-product-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Название</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" className=" " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Описание</FormLabel>

                <FormControl>
                  <Textarea {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Цена</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      try {
                        field.onChange(+e.target.value)
                      } catch {
                        field.onChange(0)
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Количество</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      try {
                        field.onChange(+e.target.value)
                      } catch {
                        field.onChange(0)
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Категория</FormLabel>
                <Select key="select-0" onValueChange={(value) => field.onChange(+value)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Изображение</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      field.onChange(event.target.files![0])
                    }}
                    ref={field.ref}
                    onBlur={field.onBlur}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
      </form>
    </Form>
  )
}
