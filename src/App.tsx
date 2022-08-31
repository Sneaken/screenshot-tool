import { useState } from "react";
import { window as win } from "@tauri-apps/api";
import { register } from "@tauri-apps/api/globalShortcut";

import "./App.css";

function App() {
  async function greet() {}

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>
    </div>
  );
}

export default App;
