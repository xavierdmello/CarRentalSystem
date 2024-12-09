import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import "./App.css";
import { CarsGrid } from "@/components/CarsGrid";
import { AdminControls } from "@/components/AdminControls";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/me/", {
        headers: {
          token: token || "",
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserData(data.data);
          setRole(data.data.role === "admin" ? "admin" : "user");
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
    }
  }, []);

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setRole(data.role === "admin" ? "admin" : "user");
    localStorage.setItem("token", data.access_token);
  };

  const handleLogout = () => {
    setUserData(null);
    setRole("user");
    localStorage.removeItem("token");
  };

  const handleCarAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Header 
        role={role} 
        setRole={setRole} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        userData={userData}
      />
      <main className="container mx-auto">
        {role === "admin" && <AdminControls onCarAdded={handleCarAdded} />}
        <CarsGrid onRefresh={refreshTrigger} />
      </main>
    </ThemeProvider>
  );
}

export default App;
