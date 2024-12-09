import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "@/types/car";
import { RentDialog } from "./RentDialog";
import { Button } from "@/components/ui/button";
interface CarCardProps {
  car: Car;
  onRented?: () => void;
}

export function CarCard({ car, onRented }: CarCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <img
            src={car.image_url}
            alt={`${car.make} ${car.model}`}
            className="object-cover w-full h-full"
          />
          <Badge 
            className="absolute top-2 right-2"
            variant={car.status === "available" ? "default" : "secondary"}
          >
            {car.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="flex justify-between items-center">
          <span>{car.make} {car.model}</span>
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