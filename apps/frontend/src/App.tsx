import { BrowserRouter, Route, Routes } from "react-router";
import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/"/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
