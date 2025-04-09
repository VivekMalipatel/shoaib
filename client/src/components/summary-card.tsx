import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
}

export function SummaryCard({ title, value, icon, iconColor = "text-primary-500" }: SummaryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconColor}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <div>
              <p className="text-sm font-medium text-neutral-600 truncate">
                {title}
              </p>
              <p className="text-lg font-medium text-neutral-800">
                {value}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
