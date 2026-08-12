import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

// Prevent browser extension noise (e.g., MetaMask connection rejections, web3 extension injections) from breaking runtime
window.addEventListener("unhandledrejection", (event) => {
  const reasonStr = String(event.reason?.message || event.reason || "").toLowerCase();
  if (
    reasonStr.includes("metamask") ||
    reasonStr.includes("ethereum") ||
    reasonStr.includes("wallet") ||
    reasonStr.includes("user rejected") ||
    reasonStr.includes("provider") ||
    reasonStr.includes("rpc error") ||
    reasonStr.includes("eip-1193")
  ) {
    event.preventDefault();
  }
});

window.addEventListener("error", (event) => {
  const msgStr = String(event.message || event.error?.message || "").toLowerCase();
  if (
    msgStr.includes("metamask") ||
    msgStr.includes("ethereum") ||
    msgStr.includes("wallet") ||
    msgStr.includes("user rejected") ||
    msgStr.includes("provider") ||
    msgStr.includes("rpc error") ||
    msgStr.includes("eip-1193")
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

