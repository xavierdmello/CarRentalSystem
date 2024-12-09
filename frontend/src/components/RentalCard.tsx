import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RentalCardProps {
  rental: {
    rental_id: number;
    car: {
      make: string;
      model: string;
      image_url?: string;
      daily_rent: number;
      year?: number;
      category?: string;
    };
    rental_date: string;
    return_date: string;
    total_cost: number;
    status: string;
  };
  onReturn?: () => void;
}

export function RentalCard({ rental, onReturn }: RentalCardProps) {
  const { toast } = useToast();

  const handleReturn = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/car_return/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify({
          rental_id: rental.rental_id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to return car");
      }

      toast({
        title: "Car Returned Successfully",
        description: `Thank you for returning the ${rental.car.make} ${rental.car.model}.`,
      });
      
      if (onReturn) {
        onReturn();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Returning Car",
        description: error instanceof Error ? error.message : "Failed to return car",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative bg-muted">
          {rental.car?.image_url ? (
            <img
              src={rental.car.image_url}
              alt={`${rental.car.make} ${rental.car.model}`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge
            className="absolute top-2 right-2"
            variant={rental.status === "ongoing" ? "default" : "secondary"}
          >
            {rental.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="flex justify-between items-center mb-2">
          <span>
            {rental.car?.make} {rental.car?.model}
          </span>
          <span className="text-xl font-bold">${rental.total_cost}</span>
        </CardTitle>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          {rental.car?.year && <p>Year: {rental.car.year}</p>}
          {rental.car?.category && <p>Category: {rental.car.category}</p>}
          <p>Daily Rate: ${rental.car?.daily_rent}/day</p>
          <p>Rental Date: {format(new Date(rental.rental_date), 'MMM dd, yyyy')}</p>
          <p>Return Date: {format(new Date(rental.return_date), 'MMM dd, yyyy')}</p>
        </div>
      </CardContent>
      <CardFooter>
        {rental.status === "ongoing" && (
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={handleReturn}
          >
            Return Car
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
