
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Mail, Phone, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { sendVerificationCode, verifyCode } from "@/utils/verificationService";

// Sample data
const specialties = [
  { id: 1, name: "General Surgeon" },
  { id: 2, name: "Anesthesia & Critical Care" },
  { id: 3, name: "Consultant Orthopedic, Arthroplasty & Arthroscopy" },
  { id: 4, name: "Dermatologist" },
  { id: 5, name: "E.N.T Specialist" },
  { id: 6, name: "Gastroenterology" },
  { id: 7, name: "General Medicine" },
  { id: 8, name: "Gynecologist & Obstetrician " },
  { id: 9, name: "Interventional Cardiologist" },
  { id: 10, name: "Nephrologist" },
  { id: 11, name: "Neuro Physician" },
  { id: 12, name: "Neuro Surgeon" },
  { id: 13, name: "Oral Maxillofacial Surgeon" },
  { id: 14, name: "Orthopedic Surgeon" },
  { id: 15, name: "Pediatrician" },
  { id: 16, name: "Physiotherapist" },
  { id: 17, name: "Plastic & Cosmetic Surgeon"},
  { id: 18, name: "Pulmonologist" },
  { id: 19, name: "Rheumatologist" },
];

const locations = [
  { id: 1, name: "Ameerpet - DK Road" },
  { id: 2, name: "Ameerpet - Lal-Banglow" },
  { id: 3, name: "Kompally" },
  { id: 4, name: "Ameerpet - Shyamkaran Road"},
  { id: 5, name: "Sangareddy" },
  { id: 6, name: "Hastinapuram" },
];

const doctors = [
  { id: 1, name: "Dr. SAI SUDHAKAR" , specialtyId: 1 },
  { id: 2, name: "Dr. Sarah Johnson", specialtyId: 2 },
  { id: 3, name: "Dr. Robert Chen", specialtyId: 3 },
  { id: 4, name: "Dr. Emily Davis", specialtyId: 4 },
  { id: 5, name: "Dr. Michael Wilson", specialtyId: 5 },
  { id: 6, name: "Dr. Jessica Brown", specialtyId: 1 },
  { id: 7, name: "Dr. James Williams", specialtyId: 1 },
  { id: 8, name: "Dr. Patricia Miller", specialtyId: 1 },
  { id: 9, name: "Dr. John Martinez", specialtyId: 2 },
  { id: 10, name: "Dr. Jennifer Taylor", specialtyId: 3 },
];

// Time slots
const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM"
];

// Regex patterns for validation
const PHONE_REGEX = /^\d{10}$/; // Simple 10-digit validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const AppointmentForm = () => {
  const [availableDoctors, setAvailableDoctors] = useState(doctors);
  
  // Verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Verification dialogs
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  
  // Verification codes
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [enteredPhoneCode, setEnteredPhoneCode] = useState("");
  const [enteredEmailCode, setEnteredEmailCode] = useState("");
  
  // Initialize form
  const form = useForm({
    defaultValues: {
      appointmentType: "in-person",
    },
    mode: "onChange", // Validate on change
  });
  
  // Watch specialty to filter doctors
  const specialty = form.watch("specialty");
  const phoneNumber = form.watch("phoneNumber");
  const email = form.watch("email");
  
  // Update available doctors when specialty changes - MODIFIED TO LIMIT TO 3 DOCTORS
  useEffect(() => {
    if (specialty) {
      const specialtyId = parseInt(specialty);
      const filteredDoctors = doctors
        .filter((doctor) => doctor.specialtyId === specialtyId)
        .slice(0, 3); // Limit to maximum 3 doctors
      
      setAvailableDoctors(filteredDoctors);
      form.setValue("doctor", "");
    }
  }, [specialty, form]);
  
  // Handle phone verification
  const handlePhoneVerification = () => {
    const phone = form.getValues("phoneNumber");
    
    // Validate phone number first
    if (!PHONE_REGEX.test(phone)) {
      toast("Invalid phone number", {
        description: "Please enter a valid 10-digit phone number."
      });
      return;
    }
    
    // Send verification code
    const code = sendVerificationCode("phone", phone);
    setPhoneVerificationCode(code);
    setPhoneVerificationOpen(true);
  };
  
  // Handle email verification
  const handleEmailVerification = () => {
    const email = form.getValues("email");
    
    // Validate email first
    if (!EMAIL_REGEX.test(email)) {
      toast("Invalid email address", {
        description: "Please enter a valid email address."
      });
      return;
    }
    
    // Send verification code
    const code = sendVerificationCode("email", email);
    setEmailVerificationCode(code);
    setEmailVerificationOpen(true);
  };
  
  // Verify phone code
  const verifyPhoneCode = () => {
    if (enteredPhoneCode === phoneVerificationCode) {
      setPhoneVerified(true);
      setPhoneVerificationOpen(false);
      toast("Phone verified", {
        description: "Your phone number has been verified successfully."
      });
    } else {
      toast("Invalid code", {
        description: "The verification code you entered is incorrect. Please try again."
      });
    }
  };
  
  // Verify email code
  const verifyEmailCode = () => {
    if (enteredEmailCode === emailVerificationCode) {
      setEmailVerified(true);
      setEmailVerificationOpen(false);
      toast("Email verified", {
        description: "Your email address has been verified successfully."
      });
    } else {
      toast("Invalid code", {
        description: "The verification code you entered is incorrect. Please try again."
      });
    }
  };
  
  // Reset verification when contact info changes
  useEffect(() => {
    setPhoneVerified(false);
  }, [phoneNumber]);
  
  useEffect(() => {
    setEmailVerified(false);
  }, [email]);
  
  // Form submission
  function onSubmit(data) {
    // Check if phone and email are verified
    if (!phoneVerified) {
      toast("Phone verification required", {
        description: "Please verify your phone number before submitting."
      });
      return;
    }
    
    if (!emailVerified) {
      toast("Email verification required", {
        description: "Please verify your email address before submitting."
      });
      return;
    }
    
    // All verifications passed, submit the form
    toast("Appointment Requested", {
      description: "We'll confirm your appointment shortly."
    });
    console.log(data);
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
          {/* Step 1: Select Department and Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Select Department and Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty/Department <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Branch <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Step 2: Select Doctor */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Select Doctor</h2>
            <FormField
              control={form.control}
              name="doctor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a Doctor <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!specialty}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!specialty && (
                    <FormDescription>
                      Please select a specialty first
                    </FormDescription>
                  )}
                  {specialty && availableDoctors.length === 3 && (
                    <FormDescription>
                      Showing top 3 doctors for this specialty
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Appointment Type <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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

          {/* Step 3: Select Date and Time */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Select Date and Time</h2>
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
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
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
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            // Disable past dates and weekends
                            return (
                              date < today ||
                              date.getDay() === 0 ||
                              date.getDay() === 6
                            );
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.getValues("appointmentDate")}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!form.getValues("appointmentDate") && (
                      <FormDescription>
                        Please select a date first
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Step 4: Your Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 4: Your Information</h2>
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
                              {phoneVerified && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <Check className="h-5 w-5 text-green-500" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="whitespace-nowrap h-10 sm:w-auto"
                          onClick={handlePhoneVerification}
                          disabled={!PHONE_REGEX.test(field.value) || phoneVerified}
                        >
                          {phoneVerified ? "Verified" : "Verify Number"}
                        </Button>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-grow relative">
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input 
                              placeholder="Enter your email address"
                              type="email"
                              className="pl-10"
                              {...field} 
                            />
                            {emailVerified && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Check className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline"
                        className="whitespace-nowrap h-10 sm:w-auto"
                        onClick={handleEmailVerification}
                        disabled={!EMAIL_REGEX.test(field.value) || emailVerified}
                      >
                        {emailVerified ? "Verified" : "Verify Email"}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            className={`w-full bg-blue-600 hover:bg-blue-700 ${(!phoneVerified || !emailVerified) ? 'opacity-70' : ''}`}
            size="lg"
          >
            Verify & Book Appointment
          </Button>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setPhoneVerificationOpen(false)}
            >
              Cancel
            </Button>
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
      
      {/* Email Verification Dialog */}
      <Dialog open={emailVerificationOpen} onOpenChange={setEmailVerificationOpen}>
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
      </Dialog>
    </div>
  );
};

export default AppointmentForm;
