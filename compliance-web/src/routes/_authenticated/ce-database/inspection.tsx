import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ce-database/inspection')({
  component: () => <div>Hello /_authenticated/ce-database/inspection!</div>
})