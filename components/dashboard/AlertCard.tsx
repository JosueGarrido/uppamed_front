import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, User, Calendar, FileText } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time?: string;
  action?: {
    label: string;
    href: string;
  };
}

interface AlertCardProps {
  title: string;
  description?: string;
  alerts: AlertItem[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
}

const alertConfig = {
  urgent: {
    icon: AlertTriangle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800'
  },
  warning: {
    icon: Clock,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  info: {
    icon: FileText,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800'
  },
  success: {
    icon: Calendar,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800'
  }
};

export function AlertCard({
  title,
  description,
  alerts,
  emptyMessage = "No hay alertas",
  emptyIcon = <AlertTriangle className="h-12 w-12 text-gray-400" />,
  className = ''
}: AlertCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const IconComponent = config.icon;
              
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${config.bg} ${config.border}`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-4 w-4 ${config.text}`} />
                    <div>
                      <p className={`font-medium ${config.text}`}>
                        {alert.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {alert.description}
                      </p>
                      {alert.time && (
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.time}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={config.badge}>
                      {alert.type === 'urgent' ? 'Urgente' :
                       alert.type === 'warning' ? 'Advertencia' :
                       alert.type === 'info' ? 'Información' : 'Éxito'}
                    </Badge>
                    {alert.action && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={alert.action.href}>
                          {alert.action.label}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            {emptyIcon}
            <p className="text-gray-500 mt-4">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 