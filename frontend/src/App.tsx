import { useState } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import "./App.css";

function App() {
  const [role, setRole] = useState<"admin" | "user">("user");

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Header role={role} setRole={setRole} />
      <div className="bg-background">
        <h1>Hello World</h1>
      </div>
    </ThemeProvider>
  );
}

export default App;
