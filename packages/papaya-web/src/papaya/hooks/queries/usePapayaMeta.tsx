import { getOrCreatePapayaMeta } from '@/database/queries'
import { PapayaMeta } from '@/schema/new/legacy/PapayaMeta'
import { useQuery } from '@tanstack/react-query'

export const usePapayaMeta = () =>
  useQuery<PapayaMeta | null>({
    queryKey: ['papayaMeta'],
    queryFn: getOrCreatePapayaMeta,
    enabled: true,
    initialData: null,
  })
