import { useEffect, useState, useCallback } from "react";
import { Car, CarsResponse } from "@/types/car";
import { CarCard } from "./CarCard";
import { RentalCard } from "./RentalCard";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PaymentsTable } from "./PaymentsTable";

interface FilterParams {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
}

export function CarsGrid({
  onRefresh,
  isAdmin,
}: {
  onRefresh?: () => void | number;
  isAdmin?: boolean;
}) {
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});

  // Get unique values for filters
  const uniqueMakes = [...new Set(cars.map((car) => car.make))];
  const uniqueModels = [...new Set(cars.map((car) => car.model))];
  const uniqueYears = [...new Set(cars.map((car) => car.year))];
  const categories = ["budget", "mid-range", "luxury", "ev"];

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.make && filters.make !== "all")
        params.append("make", filters.make);
      if (filters.model && filters.model !== "all")
        params.append("model", filters.model);
      if (filters.year && filters.year !== "all")
        params.append("year", filters.year.toString());
      if (filters.category && filters.category !== "all")
        params.append("category", filters.category);

      const queryString = params.toString();
      const url = `http://localhost:8000/view_cars/${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
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
      if (!token) {
        setRentals([]);
        return;
      }

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

  const refresh = useCallback(() => {
    fetchCars();
    fetchRentals();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [filters]); // Re-fetch when filters change

  useEffect(() => {
    if (onRefresh) {
      refresh();
    }
  }, [onRefresh, refresh]);

  const resetFilters = () => {
    setFilters({});
  };

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
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, make: value }))
              }
              value={filters.make}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {uniqueMakes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, model: value }))
              }
              value={filters.model}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {uniqueModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  year: value ? parseInt(value) : undefined,
                }))
              }
              value={filters.year?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.sort().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
              value={filters.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "ev"
                      ? "EV"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={
              !filters.make &&
              !filters.model &&
              !filters.year &&
              !filters.category
            }
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard
              key={car.car_id}
              car={car}
              isAdmin={isAdmin}
              onRented={() => {
                fetchCars();
                fetchRentals();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-xl text-muted-foreground mb-2">
            No cars available at the moment
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back later for new listings
          </p>
        </div>
      )}

      {rentals.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Rentals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentals.map((rental) => (
                <RentalCard
                  key={rental.rental_id}
                  rental={rental}
                  onReturn={() => {
                    fetchCars();
                    fetchRentals();
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <Separator className="my-8" />
          <PaymentsTable />
        </>
      )}
    </div>
  );
}
