import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    // authentication will initially be undefined
    // We'll be passing down the authentication state from within a React component
    authentication: undefined!,
  },
});

export default router;
