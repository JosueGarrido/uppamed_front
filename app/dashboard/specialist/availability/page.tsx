'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { specialistService, SpecialistSchedule, SpecialistBreak } from '@/services/specialist.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Clock, 
  Calendar, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Info,
  Coffee
} from 'lucide-react';



const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export default function SpecialistAvailabilityPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<SpecialistSchedule[]>([]);
  const [breaks, setBreaks] = useState<SpecialistBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAvailability();
    }
  }, [user]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const response = await specialistService.getMySchedule();
      
      if (response.schedules) {
        setSchedules(response.schedules);
      }
      
      if (response.breaks) {
        setBreaks(response.breaks);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading availability:', error);
      setError('Error al cargar la disponibilidad');
      setLoading(false);
    }
  };

  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    setSchedules(prev => {
      const existing = prev.find(s => s.day_of_week === dayOfWeek);
      
      if (existing) {
        if (checked) {
          return prev.map(s => 
            s.day_of_week === dayOfWeek 
              ? { ...s, is_available: true }
              : s
          );
        } else {
          return prev.filter(s => s.day_of_week !== dayOfWeek);
        }
      } else if (checked) {
        const newSchedule: SpecialistSchedule = {
          id: 0, // Se asignará en el backend
          specialist_id: user!.id,
          tenant_id: user!.tenant_id!,
          day_of_week: dayOfWeek,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        };
        return [...prev, newSchedule];
      }
      
      return prev;
    });
  };

  const handleScheduleChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setSchedules(prev => 
      prev.map(s => 
        s.day_of_week === dayOfWeek 
          ? { ...s, [field]: value }
          : s
      )
    );
  };

  const handleBreakToggle = (dayOfWeek: number, checked: boolean) => {
    setBreaks(prev => {
      const existing = prev.find(b => b.day_of_week === dayOfWeek);
      
      if (existing) {
        if (checked) {
          return prev.map(b => 
            b.day_of_week === dayOfWeek 
              ? { ...b, start_time: '12:00', end_time: '13:00' }
              : b
          );
        } else {
          return prev.filter(b => b.day_of_week !== dayOfWeek);
        }
      } else if (checked) {
        const newBreak: SpecialistBreak = {
          id: 0, // Se asignará en el backend
          specialist_id: user!.id,
          tenant_id: user!.tenant_id!,
          day_of_week: dayOfWeek,
          start_time: '12:00',
          end_time: '13:00',
          description: 'Almuerzo'
        };
        return [...prev, newBreak];
      }
      
      return prev;
    });
  };

  const handleBreakChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setBreaks(prev => 
      prev.map(b => 
        b.day_of_week === dayOfWeek 
          ? { ...b, [field]: value }
          : b
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validar que no haya conflictos entre horarios y breaks
      const hasConflicts = schedules.some(schedule => {
        const dayBreaks = breaks.filter(b => b.day_of_week === schedule.day_of_week);
        return dayBreaks.some(breakItem => {
          const scheduleStart = schedule.start_time;
          const scheduleEnd = schedule.end_time;
          const breakStart = breakItem.start_time;
          const breakEnd = breakItem.end_time;
          
          return (breakStart >= scheduleStart && breakStart < scheduleEnd) ||
                 (breakEnd > scheduleStart && breakEnd <= scheduleEnd) ||
                 (breakStart <= scheduleStart && breakEnd >= scheduleEnd);
        });
      });

      if (hasConflicts) {
        toast.error('Hay conflictos entre los horarios de trabajo y los descansos');
        return;
      }

      // Filtrar solo los horarios que están habilitados
      const activeSchedules = schedules.filter(s => s.is_available);
      await specialistService.updateMySchedule(activeSchedules);
      
      toast.success('Disponibilidad actualizada correctamente');
      setSaving(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Error al guardar la disponibilidad');
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSchedules([]);
    setBreaks([]);
  };

  const isDayEnabled = (dayOfWeek: number) => {
    return schedules.some(s => s.day_of_week === dayOfWeek && s.is_available);
  };

  const isBreakEnabled = (dayOfWeek: number) => {
    return breaks.some(b => b.day_of_week === dayOfWeek);
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return schedules.find(s => s.day_of_week === dayOfWeek);
  };

  const getBreakForDay = (dayOfWeek: number) => {
    return breaks.find(b => b.day_of_week === dayOfWeek);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando disponibilidad...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadAvailability}>
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Gestión de Disponibilidad"
        text="Configura tus horarios de trabajo y descansos para optimizar la programación de citas"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restablecer
          </Button>
        </div>
      </DashboardHeader>

      {/* Información */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Info className="mr-2 h-5 w-5 text-blue-600" />
            Información Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Horarios de Trabajo</h4>
              <p className="text-sm text-gray-600">
                Define los días y horarios en los que estás disponible para atender pacientes.
                Los administradores usarán esta información para programar citas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Descansos</h4>
              <p className="text-sm text-gray-600">
                Configura tus descansos diarios (almuerzo, café, etc.) para evitar que se programen 
                citas durante estos períodos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de horarios */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Horarios de trabajo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Horarios de Trabajo
            </CardTitle>
            <CardDescription>
              Selecciona los días y horarios en los que trabajas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={isDayEnabled(day.value)}
                    onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="font-medium">
                    {day.label}
                  </Label>
                </div>
                
                {isDayEnabled(day.value) && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${day.value}`} className="text-sm">
                        Hora de inicio
                      </Label>
                      <Input
                        id={`start-${day.value}`}
                        type="time"
                        value={getScheduleForDay(day.value)?.start_time || '09:00'}
                        onChange={(e) => handleScheduleChange(day.value, 'start_time', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-${day.value}`} className="text-sm">
                        Hora de fin
                      </Label>
                      <Input
                        id={`end-${day.value}`}
                        type="time"
                        value={getScheduleForDay(day.value)?.end_time || '17:00'}
                        onChange={(e) => handleScheduleChange(day.value, 'end_time', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Descansos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Coffee className="mr-2 h-5 w-5 text-orange-600" />
              Descansos
            </CardTitle>
            <CardDescription>
              Configura tus descansos diarios (almuerzo, café, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`break-${day.value}`}
                    checked={isBreakEnabled(day.value)}
                    onCheckedChange={(checked) => handleBreakToggle(day.value, checked as boolean)}
                    disabled={!isDayEnabled(day.value)}
                  />
                  <Label 
                    htmlFor={`break-${day.value}`} 
                    className={`font-medium ${!isDayEnabled(day.value) ? 'text-gray-400' : ''}`}
                  >
                    {day.label}
                  </Label>
                </div>
                
                {isBreakEnabled(day.value) && isDayEnabled(day.value) && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor={`break-start-${day.value}`} className="text-sm">
                        Inicio del descanso
                      </Label>
                      <Input
                        id={`break-start-${day.value}`}
                        type="time"
                        value={getBreakForDay(day.value)?.start_time || '12:00'}
                        onChange={(e) => handleBreakChange(day.value, 'start_time', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`break-end-${day.value}`} className="text-sm">
                        Fin del descanso
                      </Label>
                      <Input
                        id={`break-end-${day.value}`}
                        type="time"
                        value={getBreakForDay(day.value)?.end_time || '13:00'}
                        onChange={(e) => handleBreakChange(day.value, 'end_time', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Resumen */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5 text-green-600" />
            Resumen de Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DAYS_OF_WEEK.map((day) => {
              const schedule = getScheduleForDay(day.value);
              const breakItem = getBreakForDay(day.value);
              
              return (
                <div key={day.value} className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{day.label}</h4>
                  
                  {schedule ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-gray-600">
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                      
                      {breakItem && (
                        <div className="flex items-center text-sm">
                          <Coffee className="h-4 w-4 text-orange-600 mr-2" />
                          <span className="text-gray-600">
                            Descanso: {breakItem.start_time} - {breakItem.end_time}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Disponible
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No disponible
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
} 