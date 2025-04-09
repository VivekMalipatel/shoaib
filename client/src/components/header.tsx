import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CalendarClock, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userRole: "doctor" | "patient";
}

export function Header({ userRole }: HeaderProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-500">MediConnect</h1>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href={userRole === "doctor" ? "/" : "/patient"}>
                <a className="border-primary-500 text-neutral-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
              </Link>
              <Link href={userRole === "doctor" ? "/appointments" : "/patient/appointments"}>
                <a className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {userRole === "doctor" ? "Appointments" : "My Appointments"}
                </a>
              </Link>
              {userRole === "doctor" ? (
                <Link href="/availability">
                  <a className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Availability
                  </a>
                </Link>
              ) : (
                <Link href="/patient/book">
                  <a className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Book Appointment
                  </a>
                </Link>
              )}
              <Link href={userRole === "doctor" ? "/profile" : "/patient/profile"}>
                <a className="border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Profile
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {userRole === "doctor" ? (
                <Button className="inline-flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
              ) : (
                <Button className="inline-flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              )}
            </div>
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative w-8 h-8 rounded-full"
                    aria-label="User menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={userRole === "doctor" ? "/profile" : "/patient/profile"}>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
