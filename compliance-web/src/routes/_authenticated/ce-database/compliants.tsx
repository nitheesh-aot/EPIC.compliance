import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ce-database/compliants')({
  component: () => <div>Hello /_authenticated/ce-database/compliants!</div>
})
