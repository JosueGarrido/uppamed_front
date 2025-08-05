import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  className?: string;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    icon: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    icon: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    icon: 'text-orange-600'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    icon: 'text-red-600'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    icon: 'text-yellow-600'
  }
};

export function MetricsCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  description,
  color = 'blue',
  className = ''
}: MetricsCardProps) {
  const colors = colorConfig[color];

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {(trend || trendValue || description) && (
              <div className="flex items-center mt-1">
                {trend && getTrendIcon()}
                <span className="text-xs text-gray-500 ml-1">
                  {trendValue || description}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 ${colors.bg} rounded-lg`}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 