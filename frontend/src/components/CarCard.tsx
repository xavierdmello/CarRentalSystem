import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "@/types/car";
import { RentDialog } from "./RentDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CarCardProps {
  car: Car;
  onRented?: () => void;
  isAdmin?: boolean;
}

export function CarCard({ car, onRented, isAdmin }: CarCardProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/delete_car/${car.car_id}`,
        {
          method: "POST",
          headers: {
            token: token || "",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete car");
      }

      toast({
        title: "Car Deleted",
        description: `${car.make} ${car.model} has been removed from the listings.`,
      });
      onRented?.(); // Use the same callback to refresh the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Deleting Car",
        description:
          error instanceof Error ? error.message : "Failed to delete car",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <img
            src={car.image_url}
            alt={`${car.make} ${car.model}`}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-2 right-2 left-2 flex justify-between items-center z-10">
            <div>
              {isAdmin && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
            <Badge
              variant={car.status === "available" ? "default" : "secondary"}
            >
              {car.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="flex justify-between items-center">
          <span>
            {car.make} {car.model}
          </span>
          <span className="text-xl font-bold">${car.daily_rent}/day</span>
        </CardTitle>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>Year: {car.year}</p>
          <p>Category: {car.category}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {car.status === "available" ? (
          <RentDialog car={car} onSuccess={onRented} />
        ) : (
          <Button className="w-full" disabled>
            Not Available
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
