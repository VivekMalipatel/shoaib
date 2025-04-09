import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { SummaryCard } from "@/components/summary-card";
import { AppointmentList } from "@/components/appointment-list";
import { DoctorList } from "@/components/doctor-list";
import { AppointmentModal } from "@/components/appointment-modal";
import { AppointmentWithNames, TimeSlot, DoctorWithAvailability } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, HistoryIcon, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDoctorName, setSelectedDoctorName] = useState<string>("");

  // Fetch patient's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<AppointmentWithNames[]>({
    queryKey: ["/api/patients", user?.id, "appointments"],
    enabled: !!user?.id,
  });

  // Fetch doctors
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery<DoctorWithAvailability[]>({
    queryKey: ["/api/doctors"],
    enabled: !!user?.id,
  });

  // Mock available time slots (would come from the API in a real app)
  const availableSlots: TimeSlot[] = [
    { time: "9:00 AM", isAvailable: true },
    { time: "9:30 AM", isAvailable: true },
    { time: "10:00 AM", isAvailable: false },
    { time: "10:30 AM", isAvailable: false },
    { time: "11:00 AM", isAvailable: true },
    { time: "11:30 AM", isAvailable: true },
    { time: "1:00 PM", isAvailable: true },
    { time: "1:30 PM", isAvailable: true },
    { time: "2:00 PM", isAvailable: true },
    { time: "2:30 PM", isAvailable: true },
    { time: "3:00 PM", isAvailable: true },
    { time: "3:30 PM", isAvailable: false },
  ];

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients", user?.id, "appointments"] });
      toast({
        title: "Appointment booked",
        description: "Your appointment has been booked successfully",
      });
      setIsAppointmentModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message || "There was an error booking your appointment",
        variant: "destructive",
      });
    },
  });

  // Calculate summary cards data
  const upcomingAppointments = appointments.filter(
    (appointment) => 
      new Date(appointment.date) > new Date() && 
      appointment.status === "scheduled"
  );
  
  const pastAppointments = appointments.filter(
    (appointment) => 
      new Date(appointment.date) <= new Date() || 
      appointment.status === "completed"
  );

  // For demo purposes - number of prescriptions
  const prescriptionsCount = 3;

  const handleBookAppointment = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctorId(doctorId);
      setSelectedDoctorName(doctor.fullName);
      setIsAppointmentModalOpen(true);
    }
  };

  const handleAppointmentConfirm = (formData: any) => {
    if (!selectedDoctorId || !user) return;
    
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
    
    const appointmentData = {
      patientId: user.id,
      doctorId: selectedDoctorId,
      date: appointmentDateTime.toISOString(),
      type: formData.type,
      notes: formData.notes || "",
      status: "scheduled",
    };
    
    createAppointmentMutation.mutate(appointmentData);
  };

  const handleViewAppointmentDetails = (appointmentId: number) => {
    // This would open a modal with appointment details
    console.log("View appointment details", appointmentId);
  };

  const handleRescheduleAppointment = (appointmentId: number) => {
    // This would open the appointment modal with existing appointment data
    console.log("Reschedule appointment", appointmentId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="patient" />
      
      <main className="flex-1 pb-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-4">
            <h2 className="text-2xl font-bold leading-7 text-neutral-800 sm:text-3xl">Welcome, {user?.fullName}</h2>
            <p className="mt-1 text-sm text-neutral-600">Manage your appointments and health records</p>
          </div>
          
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard 
              title="Upcoming Appointments" 
              value={upcomingAppointments.length} 
              icon={<Calendar className="h-5 w-5" />} 
            />
            <SummaryCard 
              title="Past Appointments" 
              value={pastAppointments.length} 
              icon={<HistoryIcon className="h-5 w-5" />} 
              iconColor="text-green-500"
            />
            <SummaryCard 
              title="Prescriptions" 
              value={prescriptionsCount} 
              icon={<Pill className="h-5 w-5" />} 
              iconColor="text-yellow-500"
            />
          </div>
          
          <Tabs defaultValue="upcoming" className="mt-8">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
              <TabsTrigger value="find">Find a Doctor</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <AppointmentList 
                    appointments={upcomingAppointments}
                    userRole="patient"
                    onViewDetails={handleViewAppointmentDetails}
                    onReschedule={handleRescheduleAppointment}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="find">
              <DoctorList 
                doctors={doctors}
                onBookAppointment={handleBookAppointment}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppointmentModal 
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onConfirm={handleAppointmentConfirm}
        doctorId={selectedDoctorId || undefined}
        doctorName={selectedDoctorName}
        availableSlots={availableSlots}
      />
    </div>
  );
}
