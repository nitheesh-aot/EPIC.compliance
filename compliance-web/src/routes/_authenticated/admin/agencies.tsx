import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/agencies')({
  component: () => <div>Hello /_authenticated/admin/agencies!</div>
})