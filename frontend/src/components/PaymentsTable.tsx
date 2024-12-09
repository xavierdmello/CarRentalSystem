import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  payment_id: number;
  rental_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
}

export function PaymentsTable() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/get_payments/", {
        headers: {
          token: token || "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch payments");
      }

      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch payments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Loading payments...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment History</h2>
      {payments.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Rental ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.payment_id}>
                  <TableCell>{payment.payment_id}</TableCell>
                  <TableCell>{payment.rental_id}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(payment.payment_date), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {payment.payment_method.replace("_", " ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No payment history available
        </div>
      )}
    </div>
  );
} 