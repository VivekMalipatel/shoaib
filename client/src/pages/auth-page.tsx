import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { userSchema } from '../types/schema';
import { Redirect } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Mail, Phone, Award, CreditCard } from 'lucide-react';

// Create a login schema for form validation
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Fix the role type by explicitly defining it as a union of string literals
const customUserSchema = userSchema.extend({
  role: z.enum(['patient', 'doctor']), // Use z.enum for better type safety
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof customUserSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { loginMutation, registerMutation, user } = useAuth();
  const { toast } = useToast();

  // Define login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Define registration form with proper typing
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(customUserSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'patient', // This is now properly typed
      phone: '',
      specialization: '',
      licenseNumber: '',
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
      },
    });
  };

  // Handle registration submission
  const onRegisterSubmit = (data: any) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created!',
        });
      },
    });
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return user.role === 'doctor' ? <Redirect to="/" /> : <Redirect to="/patient" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side: Form container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="space-y-1 bg-gradient-to-r from-primary-50 to-blue-50 pb-6">
              <CardTitle className="text-3xl font-bold text-center text-primary">
                MediConnect
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Your healthcare management solution
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-6">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
                  <TabsTrigger value="register" className="text-base">Register</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Username</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input 
                                  placeholder="Enter your username" 
                                  className="pl-10 py-6 h-12" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Password</FormLabel>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 py-6 h-12" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 mt-6 text-base font-medium" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Please wait
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Registration Tab */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Full Name</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input 
                                  placeholder="John Smith" 
                                  className="pl-10 py-6 h-12" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Username</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input 
                                  placeholder="johnsmith" 
                                  className="pl-10 py-6 h-12" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Email</FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="john@example.com" 
                                  className="pl-10 py-6 h-12" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Password</FormLabel>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="pl-10 py-6 h-12" 
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Confirm</FormLabel>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="pl-10 py-6 h-12" 
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">I am a</FormLabel>
                            <select
                              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Phone (optional)</FormLabel>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <FormControl>
                                <Input 
                                  placeholder="+1 (555) 123-4567" 
                                  className="pl-10 py-6 h-12" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {registerForm.watch('role') === 'doctor' && (
                        <>
                          <FormField
                            control={registerForm.control}
                            name="specialization"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Specialization</FormLabel>
                                <div className="relative">
                                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <FormControl>
                                    <Input 
                                      placeholder="Cardiology" 
                                      className="pl-10 py-6 h-12" 
                                      {...field} 
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="licenseNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">License Number</FormLabel>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <FormControl>
                                    <Input 
                                      placeholder="MD12345" 
                                      className="pl-10 py-6 h-12" 
                                      {...field} 
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 mt-6 text-base font-medium" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Please wait
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-5 pb-5 px-6 bg-gray-50">
              <p className="text-sm text-muted-foreground">
                {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                >
                  {activeTab === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side: Hero section */}
      <div className="flex-1 bg-primary-600 p-8 hidden md:flex flex-col justify-center items-center text-white">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">Healthcare Management Made Simple</h1>
          <p className="text-xl mb-6">
            Connect with doctors, schedule appointments, and manage your healthcare journey all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">For Patients</h3>
              <p>Easy appointment booking with your preferred doctors</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">For Doctors</h3>
              <p>Efficient practice management and scheduling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}