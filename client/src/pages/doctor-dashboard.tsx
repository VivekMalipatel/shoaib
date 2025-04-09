import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Check, Clock, X, Calendar, CalendarDays } from "lucide-react";
import { Header } from "@/components/header";
import { SummaryCard } from "@/components/summary-card";
import { AppointmentList } from "@/components/appointment-list";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { AppointmentWithNames, DayAvailability, TimeSlot } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Fetch doctor's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<AppointmentWithNames[]>({
    queryKey: ["/api/doctors", user?.id, "appointments"],
    enabled: !!user?.id,
  });

  // Fetch doctor's availability
  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery<DayAvailability[]>({
    queryKey: ["/api/doctors", user?.id, "availability"],
    enabled: !!user?.id,
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveAvailability = (date: Date, slots: TimeSlot[]) => {
    // This would be implemented with a mutation to save the availability
    console.log("Saving availability for", date, slots);
  };

  // Calculate summary cards data
  const todayDate = new Date();
  const todayAppointments = appointments.filter(
    (appointment) => format(new Date(appointment.date), "yyyy-MM-dd") === format(todayDate, "yyyy-MM-dd")
  );
  
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );
  
  const upcomingAppointments = appointments.filter(
    (appointment) => 
      new Date(appointment.date) > todayDate && 
      appointment.status === "scheduled"
  );
  
  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  );

  const handleViewAppointmentDetails = (appointmentId: number) => {
    // This would open a modal with appointment details
    console.log("View appointment details", appointmentId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="doctor" />
      
      <main className="flex-1 pb-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-4">
            <h2 className="text-2xl font-bold leading-7 text-neutral-800 sm:text-3xl">Welcome back, Dr. {user?.fullName}</h2>
            <p className="mt-1 text-sm text-neutral-600">Here's your schedule for today, {format(todayDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
          
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard 
              title="Today's Appointments" 
              value={todayAppointments.length} 
              icon={<Calendar className="h-5 w-5" />} 
            />
            <SummaryCard 
              title="Completed" 
              value={completedAppointments.length} 
              icon={<Check className="h-5 w-5" />} 
              iconColor="text-green-500"
            />
            <SummaryCard 
              title="Upcoming" 
              value={upcomingAppointments.length} 
              icon={<Clock className="h-5 w-5" />} 
              iconColor="text-yellow-500"
            />
            <SummaryCard 
              title="Cancelled" 
              value={cancelledAppointments.length} 
              icon={<X className="h-5 w-5" />} 
              iconColor="text-red-500"
            />
          </div>
          
          <Tabs defaultValue="appointments" className="mt-8">
            <TabsList>
              <TabsTrigger value="appointments">Today's Schedule</TabsTrigger>
              <TabsTrigger value="availability">Manage Availability</TabsTrigger>
            </TabsList>
            <TabsContent value="appointments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Today's Schedule</CardTitle>
                  <Button variant="outline" size="sm">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Change Date
                  </Button>
                </CardHeader>
                <CardContent>
                  <AppointmentList 
                    appointments={todayAppointments}
                    userRole="doctor"
                    onViewDetails={handleViewAppointmentDetails}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="availability">
              <div className="mt-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-neutral-800">Manage Availability</h3>
                  <div className="flex space-x-3">
                    <div className="flex items-center text-sm text-neutral-600">
                      <span className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></span>
                      Available
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <span className="h-3 w-3 rounded-full bg-red-500 mr-1.5"></span>
                      Booked
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <span className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></span>
                      Tentative
                    </div>
                  </div>
                </div>
                
                <AvailabilityCalendar 
                  availability={availability}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onSaveAvailability={handleSaveAvailability}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
