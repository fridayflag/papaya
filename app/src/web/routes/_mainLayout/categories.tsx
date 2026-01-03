import ManageCategories from '@/components/journal/categories/ManageCategories'
import LayoutContainer from '@/layouts/LayoutContainer'
import { createFileRoute } from '@tanstack/react-router'

const CategoriesPage = () => {
  return (
    <LayoutContainer>
      <ManageCategories />
    </LayoutContainer>
  )
}

export const Route = createFileRoute('/_mainLayout/categories')({
  component: CategoriesPage,
})
