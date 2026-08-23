import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./index.css";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import OrganisationsPage from "./pages/OrganisationsPage";
import DashboardPage from "./pages/DashboardPage";
import BoardPage from "./pages/BoardPage";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/boards/:boardId" element={<BoardPage />} />
          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
