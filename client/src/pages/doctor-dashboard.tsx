import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  Calendar as CalendarIcon, 
  User, 
  AlertTriangle, 
  LogOut,
  MoreVertical,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Appointment, TimeSlot, Availability } from '@shared/schema';
import { format, parseISO, isSameDay } from 'date-fns';

export default function DoctorDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState('appointments');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/doctors', user?.id, 'appointments'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { getDoctorAppointments } = await import('../lib/flaskApi');
        const data = await getDoctorAppointments();
        console.log('Fetched appointments from Flask', data);
        return data as Appointment[];
      } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Fetch availability
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['/api/doctors', user?.id, 'availability'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { getDoctorAvailability } = await import('../lib/flaskApi');
        const data = await getDoctorAvailability(user.id);
        console.log('Fetched availability from Flask', data);
        return data as Availability[];
      } catch (error) {
        console.error('Error fetching availability:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Add/update availability
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (data: { doctorId: number; dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }) => {
      try {
        const { setDoctorAvailability } = await import('../lib/flaskApi');
        const result = await setDoctorAvailability(data.doctorId, data);
        console.log('Saved availability with Flask', result);
        return result;
      } catch (error) {
        console.error('Error saving availability:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', user?.id, 'availability'] });
      toast({
        title: 'Availability updated',
        description: 'Your availability has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create time slots for the selected day
  useEffect(() => {
    if (selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);

      // Generate default time slots from 9 AM to 5 PM
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 17; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push({
          time,
          isAvailable: dayAvailability?.isAvailable ?? false,
        });
      }

      // Mark appointments as unavailable
      const dayAppointments = appointments.filter(
        app => isSameDay(parseISO(app.date.toString()), selectedDate)
      );

      dayAppointments.forEach(app => {
        const appTime = app.date.toString().split('T')[1].substring(0, 5);
        const slotIndex = slots.findIndex(slot => slot.time === appTime);
        if (slotIndex !== -1) {
          slots[slotIndex].isAvailable = false;
          slots[slotIndex].appointmentId = app.id;
        }
      });

      setAvailableSlots(slots);
    }
  }, [selectedDate, availability, appointments]);

  // Handle date selection in calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Save availability for selected date
  const handleSaveAvailability = () => {
    if (!user?.id || !selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    const isSlotAvailable = availableSlots.some(slot => slot.isAvailable);

    saveAvailabilityMutation.mutate({
      doctorId: user.id,
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: isSlotAvailable,
    });
  };

  // Toggle availability for a time slot
  const toggleTimeSlot = (index: number) => {
    // Skip if there's an appointment already
    if (availableSlots[index].appointmentId) return;

    const newSlots = [...availableSlots];
    newSlots[index].isAvailable = !newSlots[index].isAvailable;
    setAvailableSlots(newSlots);
  };

  // Update appointment status mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: { appointmentId: number; status: string }) => {
      try {
        const { updateAppointment } = await import('../lib/flaskApi');
        const result = await updateAppointment(data.appointmentId, { status: data.status });
        console.log('Updated appointment with Flask', result);
        return result;
      } catch (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', user?.id, 'appointments'] });
      toast({
        title: 'Appointment updated',
        description: 'The appointment status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle appointment status update
  const handleUpdateAppointment = (appointmentId: number, status: string) => {
    updateAppointmentMutation.mutate({ appointmentId, status });
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Logged out',
          description: 'You have been logged out successfully.',
        });
      },
    });
  };

  // Stats calculation
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(app => app.status === 'completed').length;
  const upcomingAppointments = appointments.filter(app => app.status === 'scheduled').length;
  const cancellationRate = totalAppointments ? Math.round((appointments.filter(app => app.status === 'cancelled').length / totalAppointments) * 100) : 0;

  // Get today's appointments
  const todayAppointments = appointments.filter(app => 
    isSameDay(parseISO(app.date.toString()), new Date())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-semibold">{user.fullName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-primary mr-3" />
                <div className="text-3xl font-bold">{totalAppointments}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div className="text-3xl font-bold">{completedAppointments}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500 mr-3" />
                <div className="text-3xl font-bold">{upcomingAppointments}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Cancellation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
                <div className="text-3xl font-bold">{cancellationRate}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="availability">Manage Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Today's Appointments</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {todayAppointments.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No appointments scheduled for today
                  </div>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2 mr-4" />
                        <div>
                          <div className="font-medium">Patient #{appointment.patientId}</div>
                          <div className="text-sm text-gray-500">
                            {format(parseISO(appointment.date.toString()), 'hh:mm a')} - {appointment.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status}
                        </span>
                        
                        {appointment.status === 'scheduled' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateAppointment(appointment.id, 'completed')}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                <span>Mark as Completed</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>Cancel Appointment</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Available Time Slots</CardTitle>
                    <Button onClick={handleSaveAvailability} disabled={saveAvailabilityMutation.isPending}>
                      {saveAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {selectedDate && (
                      <div>
                        <div className="text-sm text-gray-500 mb-4">
                          {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots.map((slot, index) => (
                            <div
                              key={index}
                              onClick={() => toggleTimeSlot(index)}
                              className={`p-3 rounded-md cursor-pointer border text-center ${
                                slot.appointmentId
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed'
                                  : slot.isAvailable
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              {slot.time}
                              {slot.appointmentId && (
                                <div className="text-xs mt-1">Booked</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}