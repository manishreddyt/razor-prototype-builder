import { createRoot } from "react-dom/client";
import { BladeProvider } from "@razorpay/blade/components";
import { bladeTheme } from "@razorpay/blade/tokens";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BladeProvider themeTokens={bladeTheme} colorScheme="light">
    <App />
  </BladeProvider>
);
