import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Search, 
  LogOut, 
  ChevronDown,
  XCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';
import { Appointment, User as UserType } from '../types/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  type: z.string().min(1, 'Please select an appointment type'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function PatientDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  
  // Fetch patient's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/patients', user?.id, 'appointments'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { getPatientAppointments } = await import('../lib/flaskApi');
        const data = await getPatientAppointments();
        console.log('Fetched patient appointments from Flask', data);
        return data as Appointment[];
      } catch (error) {
        console.error('Error fetching patient appointments:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Fetch all doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: async () => {
      try {
        const { getDoctors } = await import('../lib/flaskApi');
        const data = await getDoctors();
        console.log('Fetched doctors from Flask', data);
        return data as UserType[];
      } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: {
      patientId: number;
      doctorId: number;
      date: string;
      type: string;
      notes?: string;
    }) => {
      try {
        const { createAppointment } = await import('../lib/flaskApi');
        const result = await createAppointment(data);
        console.log('Created appointment with Flask', result);
        return result;
      } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', user?.id, 'appointments'] });
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Your appointment has been scheduled.',
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

  // Setup form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      type: '',
      notes: '',
    },
  });

  // Handle form submission
  const onSubmit = (values: AppointmentFormValues) => {
    if (!user) return;

    // Combine date and time
    const dateTime = new Date(`${values.date}T${values.time}`);

    createAppointmentMutation.mutate({
      patientId: user.id,
      doctorId: parseInt(values.doctorId),
      date: dateTime.toISOString(),
      type: values.type,
      notes: values.notes,
    });
  };

  // Convenience functions
  const getUpcomingAppointments = () => {
    return appointments.filter(app => app.status === 'scheduled');
  };

  const getPastAppointments = () => {
    return appointments.filter(app => app.status === 'completed' || app.status === 'cancelled');
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.fullName : `Doctor #${doctorId}`;
  };

  // Update appointment mutation 
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
      queryClient.invalidateQueries({ queryKey: ['/api/patients', user?.id, 'appointments'] });
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

  // Handle reschedule appointment (stub for future implementation)
  const handleRescheduleAppointment = (appointmentId: number) => {
    toast({
      title: 'Reschedule',
      description: 'Reschedule functionality will be implemented soon.',
    });
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div className="text-3xl font-bold">{getUpcomingAppointments().length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Available Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-emerald-500 mr-3" />
                <div className="text-3xl font-bold">{doctors.length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Past Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-gray-500 mr-3" />
                <div className="text-3xl font-bold">{getPastAppointments().length}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Appointment Button */}
        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book a New Appointment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Doctor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                {doctor.fullName} - {doctor.specialization || 'General'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 8 }, (_, i) => {
                                const hour = i + 9;
                                return (
                                  <SelectItem
                                    key={hour}
                                    value={`${hour.toString().padStart(2, '0')}:00`}
                                  >
                                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regular-checkup">Regular Checkup</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="urgent-care">Urgent Care</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"
                            placeholder="Additional information for your doctor"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAppointmentMutation.isPending}
                    >
                      {createAppointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-8">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
            <TabsTrigger value="doctors">Available Doctors</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Your Upcoming Appointments</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {getUpcomingAppointments().length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    You don't have any upcoming appointments
                  </div>
                ) : (
                  getUpcomingAppointments().map((appointment) => (
                    <div key={appointment.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2 mr-4" />
                        <div>
                          <div className="font-medium">{getDoctorName(appointment.doctorId)}</div>
                          <div className="text-sm text-gray-500">
                            {format(parseISO(appointment.date.toString()), 'EEEE, MMMM d, yyyy')} at{' '}
                            {format(parseISO(appointment.date.toString()), 'h:mm a')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.type.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRescheduleAppointment(appointment.id)}>
                              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Reschedule</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              <span>Cancel Appointment</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Your Past Appointments</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {getPastAppointments().length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    You don't have any past appointments
                  </div>
                ) : (
                  getPastAppointments().map((appointment) => (
                    <div key={appointment.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2 mr-4" />
                        <div>
                          <div className="font-medium">{getDoctorName(appointment.doctorId)}</div>
                          <div className="text-sm text-gray-500">
                            {format(parseISO(appointment.date.toString()), 'MMMM d, yyyy')} at{' '}
                            {format(parseISO(appointment.date.toString()), 'h:mm a')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.type.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="doctors">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Available Doctors</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 w-64"
                    placeholder="Search doctors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary-100 rounded-full p-3 mr-4">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doctor.fullName}</h3>
                          <p className="text-sm text-gray-500">{doctor.specialization || 'General Practice'}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedDoctor(doctor.id);
                          form.setValue('doctorId', doctor.id.toString());
                          setIsDialogOpen(true);
                        }}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}