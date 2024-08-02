import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ir-board')({
  component: () => <div>Hello /_authenticated/ir-board!</div>
})