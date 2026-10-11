import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

async function enableMocking() {
  const useMock = import.meta.env.VITE_USE_MOCK !== "false";
  if (useMock) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
