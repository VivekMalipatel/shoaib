import { useState } from "react";
import { DoctorWithAvailability } from "@/types";
import { User, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DoctorListProps {
  doctors: DoctorWithAvailability[];
  onBookAppointment: (doctorId: number) => void;
}

export function DoctorList({ doctors, onBookAppointment }: DoctorListProps) {
  const [specialization, setSpecialization] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [timePreference, setTimePreference] = useState("");

  // Filter doctors based on search criteria
  const filteredDoctors = doctors.filter((doctor) => {
    let match = true;
    
    if (specialization && doctor.specialization !== specialization) {
      match = false;
    }
    
    // Additional filtering logic would go here for date and time
    // This would require more complicated availability checking
    
    return match;
  });

  // Get unique specializations for the dropdown
  const specializations = Array.from(
    new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))
  );

  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No doctors found</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Try adjusting your search criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium text-neutral-800">Find a Doctor</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Select
              value={specialization}
              onValueChange={setSpecialization}
            >
              <SelectTrigger id="specialization">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec as string}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="time">Time</Label>
            <Select
              value={timePreference}
              onValueChange={setTimePreference}
            >
              <SelectTrigger id="time">
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Time</SelectItem>
                <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button className="inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Find Doctors
          </Button>
        </div>

        <div className="border-t border-gray-200 mt-4">
          <div className="px-4 py-3 bg-neutral-50 text-sm font-medium text-neutral-600">
            Available Doctors ({filteredDoctors.length})
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {filteredDoctors.map((doctor) => (
              <li key={doctor.id}>
                <div className="block hover:bg-neutral-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <User className="h-10 w-10 rounded-full bg-primary-100 p-2 text-primary-500" />
                      </div>
                      <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                        <div>
                          <p className="text-sm font-medium text-primary-500">
                            Dr. {doctor.fullName}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-neutral-600">
                            <span className="truncate">{doctor.specialization}</span>
                            <span className="ml-1 flex-shrink-0 inline-block">
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                Available
                              </Badge>
                            </span>
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <div className="flex items-center text-sm text-neutral-600">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400" />
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="ml-1">(5.0)</span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-600">
                            10+ years experience
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button onClick={() => onBookAppointment(doctor.id)}>
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
