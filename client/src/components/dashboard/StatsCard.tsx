import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "increase",
  icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          </div>
          <span className={cn(
            "material-icons p-2 bg-opacity-10 rounded-full",
            iconColor,
            `bg-${iconColor.replace('text-', '')}`
          )}>
            {icon}
          </span>
        </div>
        {change && (
          <div className={cn(
            "mt-4 text-sm flex items-center",
            changeType === "increase" ? "text-green-500" : "text-red-500"
          )}>
            <span className="material-icons text-sm mr-1">
              {changeType === "increase" ? "arrow_upward" : "arrow_downward"}
            </span>
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
