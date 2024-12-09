import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from "@/types/car";
import { Badge } from "@/components/ui/badge";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
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
        <Button className="w-full" disabled={car.status !== "available"}>
          {car.status === "available" ? "Rent Now" : "Not Available"}
        </Button>
      </CardFooter>
    </Card>
  );
} 