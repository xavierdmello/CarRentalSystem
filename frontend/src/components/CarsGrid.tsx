import { useEffect, useState } from "react";
import { Car, CarsResponse } from "@/types/car";
import { CarCard } from "./CarCard";

export function CarsGrid({ onRefresh }: { onRefresh?: () => void }) {
  const [cars, setCars] = useState<Car[]>([]);
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

      if (data.success) {
        setCars(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cars");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [onRefresh]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading cars...</p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {cars.map((car) => (
        <CarCard key={car.car_id} car={car} />
      ))}
    </div>
  );
} 