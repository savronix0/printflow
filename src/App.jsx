import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { AddProduction } from "./pages/AddProduction";
import { Productions } from "./pages/Productions";
import { Products } from "./pages/Products";
import { AccessoriesPage } from "./pages/AccessoriesPage";
import { FilamentInventory } from "./pages/FilamentInventory";
import { SettingsPage } from "./pages/SettingsPage";

function AuthenticatedApp() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="productions/add" element={<AddProduction />} />
        <Route path="productions" element={<Productions />} />
        <Route path="products" element={<Products />} />
        <Route path="accessories" element={<AccessoriesPage />} />
        <Route path="filaments" element={<FilamentInventory />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
