export interface Car {
  car_id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  registration_number: string;
  status: string;
  daily_rent: number;
  image_url: string;
  created_at: string;
}

export interface CarsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Car[];
} 