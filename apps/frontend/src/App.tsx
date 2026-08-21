import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./index.css";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import OrganisationsPage from "./pages/OrganisationsPage";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
