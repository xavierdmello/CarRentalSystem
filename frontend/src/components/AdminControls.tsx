import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CarCreate } from "@/types/car";

export function AdminControls({ onCarAdded }: { onCarAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [carData, setCarData] = useState<CarCreate>({
    make: "",
    model: "",
    year: 2024,
    registration_number: 0,
    status: "available",
    daily_rent: 0,
    image_url: "",
    category: "budget",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/add_car/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify(carData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to add car");
      }

      if (data.success) {
        setIsOpen(false);
        setCarData({
          make: "",
          model: "",
          year: 2024,
          registration_number: 0,
          status: "available",
          daily_rent: 0,
          image_url: "",
          category: "budget",
        });
        onCarAdded();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add car");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Add New Car</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Car</DialogTitle>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                required
                disabled={isLoading}
                value={carData.make}
                onChange={(e) =>
                  setCarData({ ...carData, make: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                required
                disabled={isLoading}
                value={carData.model}
                onChange={(e) =>
                  setCarData({ ...carData, model: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                required
                disabled={isLoading}
                value={carData.year}
                onChange={(e) =>
                  setCarData({ ...carData, year: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration">Registration Number</Label>
              <Input
                id="registration"
                type="number"
                required
                disabled={isLoading}
                value={carData.registration_number}
                onChange={(e) =>
                  setCarData({
                    ...carData,
                    registration_number: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_rent">Daily Rent ($)</Label>
              <Input
                id="daily_rent"
                type="number"
                required
                disabled={isLoading}
                value={carData.daily_rent}
                onChange={(e) =>
                  setCarData({
                    ...carData,
                    daily_rent: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                required
                disabled={isLoading}
                value={carData.image_url}
                onChange={(e) =>
                  setCarData({ ...carData, image_url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={carData.category}
                onChange={(e) =>
                  setCarData({ ...carData, category: e.target.value })
                }
              >
                <option value="budget">Budget</option>
                <option value="mid-range">Mid Range</option>
                <option value="luxury">Luxury</option>
                <option value="ev">EV</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Car"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
