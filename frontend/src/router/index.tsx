import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./guards";
import MainLayout from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TenantList from "@/pages/tenant/TenantList";
import UserList from "@/pages/user/UserList";
import RoleList from "@/pages/user/RoleList";
import CategoryList from "@/pages/category/CategoryList";
import ContentList from "@/pages/content/ContentList";
import ContentEdit from "@/pages/content/ContentEdit";
import ReviewList from "@/pages/review/ReviewList";
import MediaLibrary from "@/pages/media/MediaLibrary";
import TagList from "@/pages/tag/TagList";
import OperationLog from "@/pages/log/OperationLog";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tenant" element={<TenantList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/roles" element={<RoleList />} />
          <Route path="/category" element={<CategoryList />} />
          <Route path="/content" element={<ContentList />} />
          <Route path="/content/:id/edit" element={<ContentEdit />} />
          <Route path="/review" element={<ReviewList />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/tag" element={<TagList />} />
          <Route path="/log" element={<OperationLog />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
