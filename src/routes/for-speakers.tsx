import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/for-speakers")({
  component: () => <Outlet />,
});
