import { useState } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import "./App.css";

interface UserData {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
  email: string;
  phone_number: string;
  name: string;
}

function App() {
  const [role, setRole] = useState<"admin" | "user">("user");
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setRole(data.role === "admin" ? "admin" : "user");
    // Store token in localStorage for persistence
    localStorage.setItem("token", data.access_token);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Header role={role} setRole={setRole} onLogin={handleLogin} />
      <div className="bg-background">
        <h1>Hello {userData ? userData.name : "World"}</h1>
      </div>
    </ThemeProvider>
  );
}

export default App;
