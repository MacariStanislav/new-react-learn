import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import CyberpunkCursor from "./app/styleControl/CyberpunkCursor";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CyberpunkCursor />
    <App />
  </React.StrictMode>
);
