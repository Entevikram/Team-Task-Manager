import { Card } from "@/components/ui/card";

export function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Card>
  );
}
