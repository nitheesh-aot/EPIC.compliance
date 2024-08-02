import ComingSoon from '@/components/Shared/ComingSoon';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ir-board')({
  component: IRBoard
})

function IRBoard() {
  return <ComingSoon />;
}
