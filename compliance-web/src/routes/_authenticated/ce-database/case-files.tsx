import ComingSoon from '@/components/Shared/ComingSoon'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ce-database/case-files')({
  component: CaseFiles
})

function CaseFiles() {
  return <ComingSoon />
}
