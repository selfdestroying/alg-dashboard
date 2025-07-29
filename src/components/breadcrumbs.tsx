'use client'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import React from 'react'

export default function MyBreadCrumbs() {
  const pathname = usePathname()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-20 truncate md:max-w-none">/</BreadcrumbPage>
        </BreadcrumbItem>
        {pathname.split('/').map(
          (breadcrumb) =>
            breadcrumb.length > 0 && (
              <React.Fragment key={breadcrumb}>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="max-w-20 truncate md:max-w-none">
                  <BreadcrumbPage>
                    {breadcrumb[0].toUpperCase() + breadcrumb.slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
