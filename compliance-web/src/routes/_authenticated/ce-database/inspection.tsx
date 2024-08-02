import ComingSoon from "@/components/Shared/ComingSoon";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ce-database/inspection")({
  component: Inspection,
});

function Inspection() {
  return <ComingSoon />;
}
