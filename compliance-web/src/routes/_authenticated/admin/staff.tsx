import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/staff')({
  component: () => <div>Hello /_authenticated/admin/staff!</div>
})