import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Mail, Phone, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { api, Department, Center, Doctor } from '@/utils/api';

// Define the form values type
type FormValues = {
  specialty: string;
  location: string;
  doctor: string;
  appointmentType: string;
  appointmentDate?: Date;
  appointmentTime?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  notes?: string;
};

// Mock verification service (replace with actual implementation)
// const sendVerificationCode = (type, value) => {
//   console.log(`Sending verification code to ${type}: ${value}`);
//   return '123456'; // Mock code
// };

const sendVerificationCode = (type: "phone" | "email", value: string): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // random 6-digit OTP
  console.log(`Sending verification code to ${type}: ${value} -> ${code}`);
  return code;
};


const verifyCode = (expected, actual) => {
  return expected === actual;
};

const PHONE_REGEX = /^\d{10}$/; // Simple 10-digit validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const AppointmentForm = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Verification dialogs
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);

  // Verification codes
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [enteredPhoneCode, setEnteredPhoneCode] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [enteredEmailCode, setEnteredEmailCode] = useState("");

  // Initialize form with proper types and all required default values
  const form = useForm<FormValues>({
    defaultValues: {
      specialty: "",
      location: "",
      doctor: "",
      appointmentType: "in-person",
      fullName: "",
      phoneNumber: "",
      email: "",
      notes: ""
    },
    mode: "onChange", // Validate on change
  });

  // Watch form values
  const specialty = form.watch("specialty");
  const location = form.watch("location");
  const doctor = form.watch("doctor");
  const phoneNumber = form.watch("phoneNumber");
  const email = form.watch("email");
  const selectedDate = form.watch("appointmentDate");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [depts, ctrs, docs] = await Promise.all([
          api.getDepartments(),
          api.getCenters(),
          api.getDoctors()
        ]);
        
        console.log('Departments:', depts);
        console.log('Centers:', ctrs);
        console.log('Doctors:', docs);

        setDepartments(depts);
        setCenters(ctrs);
        setAllDoctors(docs);
        setAvailableDoctors(docs); // Initially show all doctors
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update available doctors when specialty changes
  useEffect(() => {
    if (specialty) {
      const filteredDoctors = allDoctors.filter(doc => doc.dept_id === specialty);
      setAvailableDoctors(filteredDoctors);
      
      // If the currently selected doctor is not in this department, clear the selection
      const currentDoctor = form.getValues("doctor");
      if (currentDoctor) {
        const doctorStillValid = filteredDoctors.some(doc => doc.doctor_id === currentDoctor);
        if (!doctorStillValid) {
          form.setValue("doctor", "");
        }
      }
    } else {
      // If no specialty is selected, show all doctors
      setAvailableDoctors(allDoctors);
    }
  }, [specialty, allDoctors, form]);

  // When doctor changes, update the department if needed
  useEffect(() => {
    if (doctor) {
      const selectedDoctor = allDoctors.find(doc => doc.doctor_id === doctor);
      if (selectedDoctor && selectedDoctor.dept_id !== specialty) {
        form.setValue("specialty", selectedDoctor.dept_id);
      }
      
      // Load available slots for this doctor
      const loadAvailableSlots = async () => {
        try {
          console.log('Checking available slots for doctor:', doctor);
          const slotsResponse = await api.checkAvailableSlots(doctor);
          console.log('Slots response:', slotsResponse);
          
          if (slotsResponse && slotsResponse.avaiable_slots && slotsResponse.avaiable_slots.length > 0) {
            setAvailableSlots(slotsResponse.avaiable_slots);
            
            // Extract unique dates from slots
            const dateSet = new Set<string>();
            const dateObjects: Date[] = [];
            
            slotsResponse.avaiable_slots.forEach(slot => {
              const dateStr = slot.split('T')[0]; // Extract date part (YYYY-MM-DD)
              if (!dateSet.has(dateStr)) {
                dateSet.add(dateStr);
                dateObjects.push(new Date(dateStr));
              }
            });
            
            console.log('Available dates:', dateObjects);
            setAvailableDates(dateObjects);
            
            // Clear the selected date and time since we have new slots
            form.setValue("appointmentDate", undefined);
            form.setValue("appointmentTime", undefined);
          } else {
            setAvailableSlots([]);
            setAvailableDates([]);
            toast.warning('No available slots found for this doctor');
          }
        } catch (error) {
          console.error('Failed to load available slots:', error);
          toast.error('Failed to load available time slots. Please try again.');
        }
      };
      
      loadAvailableSlots();
    }
  }, [doctor, allDoctors, specialty, form]);

  // When selected date changes, update available times
  useEffect(() => {
    if (selectedDate && availableSlots.length > 0) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Filter slots for the selected date and extract times
      const timesForDate = availableSlots
        .filter(slot => slot.startsWith(selectedDateStr))
        .map(slot => {
          const timeStr = slot.split('T')[1].split('.')[0]; // Extract time part without milliseconds
          const [hours, minutes, seconds] = timeStr.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        });
      
      console.log('Available times for selected date:', timesForDate);
      setAvailableTimes(timesForDate);
      
      // Clear selected time since date changed
      form.setValue("appointmentTime", undefined);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, availableSlots, form]);

  // Handle phone verification
  const handlePhoneVerification = () => {
    const phone = form.getValues("phoneNumber");

    // Validate phone number first
    if (!phone || !PHONE_REGEX.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    // Send verification code
    const code = sendVerificationCode("phone", phone);
    setPhoneVerificationCode(code);
    setPhoneVerificationOpen(true);
  };


  // Verify phone code
  const verifyPhoneCode = () => {
    if (verifyCode(phoneVerificationCode, enteredPhoneCode)) {
    // if(verifyCode === phoneVerificationCode.toString()) {y
      // setPhoneVerified(true);
      setPhoneVerificationOpen(true);
      toast.success("Your phone number has been verified successfully.");
    } else {
      toast.error("The verification code you entered is incorrect. Please try again.");
    }
  };

 

  // Reset verification when contact info changes
  
  useEffect(() => {
    setPhoneVerified(true);
  }, [phoneNumber]);

  // useEffect(() => {
  //   setEmailVerified(false);
  // }, [email]);

  // Form submission
  function onSubmit(data: FormValues) {
    console.log("Form data submitted:", data);
    
    // Check required fields
    if (!data.location) {
      toast.error("Please select a hospital branch.");
      return;
    }
    
    if (!data.doctor) {
      toast.error("Please select a doctor.");
      return;
    }
    
    if (!data.appointmentDate || !data.appointmentTime) {
      toast.error("Please select both appointment date and time.");
      return;
    }

    // Check if phone and email are verified
    if (!phoneVerified) {
      toast.error("Please verify your phone number before submitting.");
      return;
    }

       

    

    // if (!emailVerified) {
    //   toast.error("Please verify your email address before submitting.");
    //   return;
    // }

    // Convert appointment date and time to the format expected by the API
    const appointmentDateTime = api.formatAppointmentDateTime(
      data.appointmentDate,
      data.appointmentTime
    );
    
    console.log("Formatted appointment datetime:", appointmentDateTime);

    // All verifications passed, submit the form
    toast.success("Appointment Requested. We'll confirm your appointment shortly.");
    
    // Here you would add the API call to save the appointment
    api.saveAppointment(data.doctor, appointmentDateTime, data.location)
      .then(response => {
        console.log("Appointment saved:", response);
        if (response.appointment_id) {
          toast.success(`Appointment confirmed! ID: ${response.appointment_id}`);
        }
      })
      .catch(error => {
        console.error("Error saving appointment:", error);
        toast.error("Failed to save appointment. Please try again.");
      });
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0047AB" strokeWidth="2" />
            <path d="M3 10H21" stroke="#0047AB" strokeWidth="2" />
            <path d="M8 2L8 6" stroke="#0047AB" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 2L16 6" stroke="#0047AB" strokeWidth="2" strokeLinecap="round" />
            <circle cx="8" cy="14" r="1" fill="#0047AB" />
            <circle cx="12" cy="14" r="1" fill="#0047AB" />
            <circle cx="16" cy="14" r="1" fill="#0047AB" />
            <circle cx="8" cy="18" r="1" fill="#0047AB" />
            <circle cx="12" cy="18" r="1" fill="#0047AB" />
            <circle cx="16" cy="18" r="1" fill="#0047AB" />
          </svg>
          <h1 className="text-2xl font-bold">Appointment Request Form</h1>
        </div>
        <p className="text-gray-600">
          Fill out the form below to schedule your appointment. Required fields are marked with an asterisk (*).
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Select Department, Location, and Doctor (reorganized) */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Select Provider and Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department selection */}
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty/Department</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log("Selected specialty:", value);
                        field.onChange(value);
                      }} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoading ? "Loading..." : "Select Specialty"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.dept_id} value={dept.dept_id}>
                            {dept.dept_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hospital Branch selection */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Branch <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log("Selected location:", value);
                        field.onChange(value);
                      }} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoading ? "Loading..." : "Select Location"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centers.map((center) => (
                          <SelectItem key={center.center_id} value={center.center_id}>
                            {center.center_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Doctor selection */}
            <div className="mt-6">
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose a Doctor <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log("Selected doctor:", value);
                        field.onChange(value);
                      }} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoading ? "Loading..." : "Select Doctor"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDoctors.map((doctor) => (
                          <SelectItem key={doctor.doctor_id} value={doctor.doctor_id}>
                            {doctor.doctor_name} - {doctor.dept_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {specialty ? `Showing doctors from ${departments.find(d => d.dept_id === specialty)?.dept_name}` : 
                        "All available doctors"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Appointment Type */}
            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Appointment Type <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="in-person" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          In-Person Visit
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="video" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Video Consultation
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Step 2: Select Date and Time */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Select Date and Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Appointment Date <span className="text-red-500">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={!doctor || availableDates.length === 0}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{!doctor ? "Select a doctor first" : "Select date"}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            // Only allow dates from the available slots
                            if (availableDates.length === 0) return true;
                            
                            return !availableDates.some(availableDate => 
                              availableDate.getDate() === date.getDate() &&
                              availableDate.getMonth() === date.getMonth() &&
                              availableDate.getFullYear() === date.getFullYear()
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {!doctor ? "Please select a doctor to see available dates" : 
                       availableDates.length === 0 ? "No available dates for this doctor" : 
                       "Select a highlighted date to see available times"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Time <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log("Selected time:", value);
                        field.onChange(value);
                      }} 
                      value={field.value || ""} 
                      disabled={!selectedDate || availableTimes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={!selectedDate ? "Select date first" : "Select time slot"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!selectedDate ? "Please select a date first" : 
                       availableTimes.length === 0 ? "No available times for selected date" : 
                       `${availableTimes.length} available time slots`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Step 3: Your Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-grow relative">
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="10-digit mobile number"
                                type="tel"
                                className="pl-10"
                                {...field} 
                              />

                            </div>
                          </FormControl>
                        </div>
                        {/* <Button 
                          type="button" 
                          variant="outline"
                          className="whitespace-nowrap h-10 sm:w-auto"
                          onClick={handlePhoneVerification} */}
                          {/* // disabled={!phoneNumber || !PHONE_REGEX.test(phoneNumber) || phoneVerified} */}
                        {/* > */}
                          {/* {phoneVerified ? "Verified" : "Verify Number"} */}
                        {/* </Button> */}
                          <Button onClick={handlePhoneVerification}>
                            Verify Number
                          </Button>

                          {phoneVerificationCode && (
                            <div className="text-green-600 text-sm mt-2">
                              OTP sent : <strong>{phoneVerificationCode}</strong>
                            </div>
                          )}

                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

      

            <div className="mt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your symptoms or reason for visit"
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className={`w-full bg-wellness-blue hover:bg-blue-700 ${(!phoneVerified || !emailVerified) ? 'opacity-70' : ''}`}
            size="lg"
          >
            Request Appointment
          </Button>

          {/* <Button 
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 ${(!phoneVerified) ? 'opacity-70 cursor-not-allowed' : ''}`}
            size="lg"
            disabled={!phoneVerified} // 👈 This is key
          >
            Verify & Book Appointment
          </Button> */}

          {/* <div className="mt-6">
          <Button 
            type="submit"
            size="lg"
            className={`w-full transition-all duration-300 
              ${form.formState.isValid && phoneVerified 
                ? 'bg-yellow-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-400 opacity-70 cursor-not-allowed text-gray-100'}`}
            disabled={!(form.formState.isValid && phoneVerified)}
          >
            Verify & Book Appointment
          </Button> 
         </div> */}
        



        </form>
      </Form>

      {/* Phone Verification Dialog */}
      <Dialog open={phoneVerificationOpen} onOpenChange={setPhoneVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your phone number</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to {form.getValues("phoneNumber")}
            </p>
            <Input
              placeholder="Enter verification code"
              value={enteredPhoneCode}
              onChange={(e) => setEnteredPhoneCode(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            {/* <Button
              type="button"
              variant="outline"
              onClick={() => setPhoneVerificationOpen(false)}
            >
              Cancel
            </Button> */}
            <Button
              type="button"
              onClick={verifyPhoneCode}
              disabled={enteredPhoneCode.length !== 6}
            >
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      
    </div>
  );
};

export default AppointmentForm;



  // <div className="mt-6">
  //             <FormField
  //               control={form.control}
  //               name="email"
  //               render={({ field }) => (
  //                 <FormItem>
  //                   <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
  //                   <div className="flex flex-col sm:flex-row gap-2">
  //                     <div className="flex-grow relative">
  //                       <FormControl>
  //                         <div className="relative">
  //                           <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
  //                           <Input 
  //                             placeholder="Enter your email address"
  //                             type="email"
  //                             className="pl-10"
  //                             {...field} 
  //                           />
  //                           {emailVerified && (
  //                             <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
  //                               <Check className="h-5 w-5 text-green-500" />
  //                             </div>
  //                           )}
  //                         </div>
  //                       </FormControl>
  //                     </div>
  //                     <Button 
  //                       type="button" 
  //                       variant="outline"
  //                       className="whitespace-nowrap h-10 sm:w-auto"
  //                       onClick={handleEmailVerification}
  //                       disabled={!email || !EMAIL_REGEX.test(email) || emailVerified}
  //                     >
  //                       {emailVerified ? "Verified" : "Verify Email"}
  //                     </Button>
  //                   </div>
  //                   <FormMessage />
  //                 </FormItem>
  //               )}
  //             />
  //           </div>

  {/* Email Verification Dialog */}
      {/* <Dialog open={emailVerificationOpen} onOpenChange={setEmailVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your email address</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to {form.getValues("email")}
            </p>
            <Input
              placeholder="Enter verification code"
              value={enteredEmailCode}
              onChange={(e) => setEnteredEmailCode(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailVerificationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={verifyEmailCode}
              disabled={enteredEmailCode.length !== 6}
            >
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}



  // Handle email verification
  // const handleEmailVerification = () => {
  //   const email = form.getValues("email");

  //   // Validate email first
  //   if (!email || !EMAIL_REGEX.test(email)) {
  //     toast.error("Please enter a valid email address.");
  //     return;
  //   }

  //   // Send verification code
  //   const code = sendVerificationCode("email", email);
  //   setEmailVerificationCode(code);
  //   setEmailVerificationOpen(true);
  // };

   // Verify email code
  // const verifyEmailCode = () => {
  //   if (verifyCode(emailVerificationCode, enteredEmailCode)) {
  //     setEmailVerified(true);
  //     setEmailVerificationOpen(false);
  //     toast.success("Your email address has been verified successfully.");
  //   } else {
  //     toast.error("The verification code you entered is incorrect. Please try again.");
  //   }
  // };