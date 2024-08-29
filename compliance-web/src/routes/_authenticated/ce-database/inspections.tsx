
import ComingSoon from "@/components/Shared/ComingSoon";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ce-database/inspections")({
  component: Inspection,
});

function Inspection() {
  return <ComingSoon />;
}
