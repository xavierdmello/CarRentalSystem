import { Button } from "@/components/ui/button"
import { Car } from "lucide-react"

interface HeaderProps {
  role: "admin" | "user"
  setRole: (role: "admin" | "user") => void
}

export function Header({ role, setRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Car Rental System</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={role === "user" ? "default" : "outline"}
            onClick={() => setRole("user")}
          >
            User
          </Button>
          <Button 
            variant={role === "admin" ? "default" : "outline"}
            onClick={() => setRole("admin")}
          >
            Admin
          </Button>
        </div>
      </div>
    </header>
  )
} 