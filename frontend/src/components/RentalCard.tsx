import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";

interface RentalCardProps {
  rental: {
    rental_id: number;
    car: {
      make: string;
      model: string;
      image_url?: string;
      daily_rent: number;
    };
    rental_date: string;
    return_date: string;
    total_cost: number;
    status: string;
  };
}

export function RentalCard({ rental }: RentalCardProps) {
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
        <CardTitle className="flex justify-between items-center">
          <span>
            {rental.car?.make} {rental.car?.model}
          </span>
          <span className="text-xl font-bold">${rental.total_cost}</span>
        </CardTitle>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>From: {new Date(rental.rental_date).toLocaleDateString()}</p>
          <p>To: {new Date(rental.return_date).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
