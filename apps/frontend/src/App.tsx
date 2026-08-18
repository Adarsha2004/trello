import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";


export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<div></div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
