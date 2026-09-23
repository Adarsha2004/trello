import { BrowserRouter, Route, Routes } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./index.css";
import LandingPage from "./pages/LandingPage";
import SigninPage from "./pages/SigninPage";
import OrganisationsPage from "./pages/OrganisationsPage";
import DashboardPage from "./pages/DashboardPage";
import BoardPage from "./pages/BoardPage";
import { RequireAuth } from "@/components/RequireAuth";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/boards/:boardId"
              element={
                <RequireAuth>
                  <BoardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/organisations"
              element={
                <RequireAuth>
                  <OrganisationsPage />
                </RequireAuth>
              }
            />
            <Route path="/signin" element={<SigninPage />} />
          </Routes>
        </DndProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
