import React from "react";

// Declare the global type
declare global {
  interface Window {
    __mentionPopovers?: Map<
      string,
      {
        Component: React.LazyExoticComponent<React.ComponentType<unknown>>;
        remove: () => void;
      }
    >;
  }
}

export const PopoverManager = () => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // Listen for changes to the popover registry
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      // Only update if we see mention elements added or removed
      const shouldUpdate = mutations.some((mutation) => {
        return (
          Array.from(mutation.addedNodes).some(
            (node) =>
              node instanceof HTMLElement &&
              (node.classList.contains("mention-chip") ||
                node.querySelector(".mention-chip"))
          ) ||
          Array.from(mutation.removedNodes).some(
            (node) =>
              node instanceof HTMLElement &&
              (node.classList.contains("mention-chip") ||
                node.querySelector(".mention-chip"))
          )
        );
      });

      if (shouldUpdate) {
        forceUpdate();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Render all registered popovers
  if (!window.__mentionPopovers) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      {Array.from(window.__mentionPopovers.entries()).map(
        ([id, { Component }]) => (
          <React.Fragment key={id}>
            <Component />
          </React.Fragment>
        )
      )}
    </React.Suspense>
  );
};
