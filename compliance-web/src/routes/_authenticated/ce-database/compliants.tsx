import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/Shared/ComingSoon";

export const Route = createFileRoute("/_authenticated/ce-database/compliants")({
  component: Compliance,
});

function Compliance() {
  return <ComingSoon />
}
