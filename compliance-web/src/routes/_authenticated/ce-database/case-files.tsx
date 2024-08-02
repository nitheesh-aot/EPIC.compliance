import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ce-database/case-files')({
  component: () => <div>Hello /_authenticated/ce-database/case-files!</div>
})