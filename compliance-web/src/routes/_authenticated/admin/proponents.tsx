import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/proponents')({
  component: () => <div>Hello /_authenticated/admin/proponents!</div>
})