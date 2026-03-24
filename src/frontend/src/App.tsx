import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import HomePage from "./pages/HomePage";
import SharePage from "./pages/SharePage";
import ViewPage from "./pages/ViewPage";

const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/share/$token",
  component: SharePage,
});

const viewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/view/$token",
  component: ViewPage,
});

const routeTree = rootRoute.addChildren([homeRoute, shareRoute, viewRoute]);

const hashHistory = createHashHistory();

const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
