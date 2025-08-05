import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StatsCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  stats: Array<{
    label: string;
    value: string | number;
    change?: string;
    progress?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  }>;
  className?: string;
}

const colorConfig = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', progress: 'bg-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600', progress: 'bg-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', progress: 'bg-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', progress: 'bg-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600', progress: 'bg-red-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', progress: 'bg-yellow-600' }
};

export function StatsCard({
  title,
  description,
  icon,
  stats,
  className = ''
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => {
          const colors = stat.color ? colorConfig[stat.color] : colorConfig.blue;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  {stat.change && (
                    <Badge className="text-xs bg-gray-100 text-gray-800">
                      {stat.change}
                    </Badge>
                  )}
                </div>
              </div>
              {stat.progress !== undefined && (
                <Progress 
                  value={stat.progress} 
                  className="h-2"
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 