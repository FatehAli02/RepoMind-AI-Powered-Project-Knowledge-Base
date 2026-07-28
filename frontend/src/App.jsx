import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Fallback: send everything else to the right place */}
        <Route
          path="*"
          element={
            <Navigate to={localStorage.getItem("access_token") ? "/dashboard" : "/auth"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}