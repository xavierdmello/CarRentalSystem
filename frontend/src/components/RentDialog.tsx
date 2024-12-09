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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Car } from "@/types/car";
import { addDays, format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RentDialogProps {
  car: Car;
  onSuccess?: () => void;
}

export function RentDialog({ car, onSuccess }: RentDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
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

      // First, create the rental
      const rentalResponse = await fetch("http://localhost:8000/book_rental/", {
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

      const rentalData = await rentalResponse.json();
      if (!rentalResponse.ok) {
        throw new Error(rentalData.detail || "Failed to rent car");
      }

      // Calculate total amount based on daily rate and rental duration
      const days = differenceInDays(new Date(dates.endDate), new Date(dates.startDate)) + 1;
      const totalAmount = car.daily_rent * days;

      // Create the payment
      const paymentResponse = await fetch("http://localhost:8000/add_payment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          rental_id: parseInt(rentalData.data.rental_id),
          amount: totalAmount,
          payment_method: paymentMethod,
        }),
      });

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentData.detail || "Failed to process payment");
      }

      toast({
        title: "Car Rented Successfully",
        description: `You have rented the ${car.make} ${car.model} from ${dates.startDate} to ${dates.endDate}.`,
      });
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Renting Car",
        description: error instanceof Error ? error.message : "Failed to rent car",
      });
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
          <DialogTitle>
            Rent {car.make} {car.model}
          </DialogTitle>
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
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
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
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
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
