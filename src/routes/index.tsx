import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/common/AppLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { Home } from "../features/home/Home";
import { PostDetail } from "../features/blog/PostDetail";
import { AdminLogin } from "../features/admin/AdminLogin";
import { AdminDashboard } from "../features/admin/AdminDashboard";
import { AdminEditor } from "../features/admin/AdminEditor";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "blog/:slug",
        element: <PostDetail />,
      },
      {
        path: "admin/login",
        element: <AdminLogin />,
      },
      {
        path: "admin",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "new",
            element: <AdminEditor />,
          },
          {
            path: "edit/:id",
            element: <AdminEditor />,
          },
        ],
      },
    ],
  },
]);
export default router;
