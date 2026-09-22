import { BrowserRouter, Route, Routes } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./index.css";
import LandingPage from "./pages/LandingPage";
import SigninPage from "./pages/SigninPage";
import OrganisationsPage from "./pages/OrganisationsPage";
import DashboardPage from "./pages/DashboardPage";
import BoardPage from "./pages/BoardPage";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/boards/:boardId" element={<BoardPage />} />
            <Route path="/organisations" element={<OrganisationsPage />} />
            <Route path="/signin" element={<SigninPage />} />
          </Routes>
        </DndProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
