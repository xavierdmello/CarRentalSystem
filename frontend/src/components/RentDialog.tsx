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
import { Car } from "@/types/car";
import { addDays, format } from "date-fns";

interface RentDialogProps {
  car: Car;
  onSuccess?: () => void;
}

export function RentDialog({ car, onSuccess }: RentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dates, setDates] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to rent a car");
      }

      const response = await fetch("http://localhost:8000/book_rental/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          car_id: car.car_id,
          rental_date: new Date(dates.startDate).toISOString(),
          return_date: new Date(dates.endDate).toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to rent car");
      }

      if (data.success) {
        setIsOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to rent car");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Rent Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rent {car.make} {car.model}</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              required
              disabled={isLoading}
              value={dates.startDate}
              onChange={(e) =>
                setDates({ ...dates, startDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              required
              disabled={isLoading}
              value={dates.endDate}
              onChange={(e) =>
                setDates({ ...dates, endDate: e.target.value })
              }
            />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm Rental"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 