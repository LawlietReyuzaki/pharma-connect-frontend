import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import AdminApp from "./App";
import "../../src/index.css"; // reuse same Tailwind / design tokens

createRoot(document.getElementById("admin-root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <AdminApp />
  </ThemeProvider>
);
