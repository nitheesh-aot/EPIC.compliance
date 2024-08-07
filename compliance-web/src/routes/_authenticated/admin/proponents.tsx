import ComingSoon from '@/components/Shared/ComingSoon';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/proponents')({
  component: Proponents
})

function Proponents() {
  return <ComingSoon />;
}
