import { useEffect, useState } from "react";
import { Car, CarsResponse } from "@/types/car";
import { CarCard } from "./CarCard";
import { RentalCard } from "./RentalCard";
import { Separator } from "./ui/separator";

export function CarsGrid({ onRefresh }: { onRefresh?: () => void }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/view_cars/");
      const data: CarsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cars");
      }

      setCars(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cars");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/my_rentals/", {
        headers: {
          token: token,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch rentals");
      }

      if (data.success && Array.isArray(data.data)) {
        setRentals(data.data);
      } else {
        setRentals([]);
      }
    } catch (error) {
      console.error("Failed to fetch rentals:", error);
      setRentals([]);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchRentals();
  }, [onRefresh]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard
              key={car.car_id}
              car={car}
              onRented={() => {
                fetchCars();
                fetchRentals();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-xl text-muted-foreground mb-2">No cars available at the moment</p>
          <p className="text-sm text-muted-foreground">Please check back later for new listings</p>
        </div>
      )}

      {rentals.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Rentals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentals.map((rental) => (
                <RentalCard key={rental.rental_id} rental={rental} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
