import ComingSoon from '@/components/Shared/ComingSoon';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/staff')({
  component: Staff
})

function Staff() {
  return <ComingSoon />;
}
