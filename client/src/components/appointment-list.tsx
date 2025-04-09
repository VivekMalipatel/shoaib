import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { AppointmentWithNames, AppointmentStatus } from "@/types";
import { Calendar, Clock, User, Phone, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AppointmentListProps {
  appointments: AppointmentWithNames[];
  userRole: "doctor" | "patient";
  onViewDetails: (appointmentId: number) => void;
  onReschedule?: (appointmentId: number) => void;
  onCancel?: (appointmentId: number) => void;
}

export function AppointmentList({ 
  appointments, 
  userRole, 
  onViewDetails, 
  onReschedule, 
  onCancel 
}: AppointmentListProps) {
  const { user } = useAuth();

  // Filter out past appointments
  const currentDate = new Date();
  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.date) > currentDate
  );

  // Sort appointments by date (nearest first)
  upcomingAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getAppointmentTypeBadge = (type: string) => {
    switch (type) {
      case "regular-checkup":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Regular Checkup</Badge>;
      case "follow-up":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Follow-up</Badge>;
      case "consultation":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Consultation</Badge>;
      case "urgent-care":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Urgent Care</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case AppointmentStatus.CANCELLED:
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (upcomingAppointments.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No upcoming appointments</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {userRole === "patient" 
                ? "Book an appointment with a doctor to get started." 
                : "Your schedule is clear."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {upcomingAppointments.map((appointment) => {
          const appointmentDate = new Date(appointment.date);
          const formattedDate = format(appointmentDate, "MMMM d, yyyy");
          const formattedTime = format(appointmentDate, "h:mm a");
          
          return (
            <li key={appointment.id}>
              <div className="block hover:bg-neutral-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-10 w-10 rounded-full bg-primary-100 p-2 text-primary-500" />
                    </div>
                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                      <div>
                        <p className="text-sm font-medium text-primary-500">
                          {userRole === "doctor" ? appointment.patientName : appointment.doctorName}
                        </p>
                        <div className="mt-1 flex items-center text-sm text-neutral-600">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
                          <span>{formattedDate}</span>
                          <Clock className="flex-shrink-0 ml-3 mr-1.5 h-4 w-4 text-neutral-400" />
                          <span>{formattedTime}</span>
                        </div>
                        <div className="mt-1 flex items-center">
                          {getAppointmentTypeBadge(appointment.type)}
                          <div className="ml-2">{getStatusBadge(appointment.status)}</div>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        {appointment.notes && (
                          <div className="flex items-center text-sm text-neutral-600">
                            <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
                            <span className="truncate">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {onReschedule && appointment.status === AppointmentStatus.SCHEDULED && (
                      <Button 
                        variant="outline" 
                        onClick={() => onReschedule(appointment.id)}
                        size="sm"
                      >
                        Reschedule
                      </Button>
                    )}
                    <Button 
                      onClick={() => onViewDetails(appointment.id)}
                      size="sm"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
