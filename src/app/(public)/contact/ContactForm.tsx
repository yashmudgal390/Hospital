"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Send, CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { submitContactMessage, submitAppointment } from "./actions";

// Zod schemas
const messageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

const appointmentSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().min(7, "Valid phone number required."),
  email: z.string().email("Valid email required.").or(z.literal("")),
  date: z.string().min(1, "Preferred date is required."),
  time: z.string().optional(),
  serviceId: z.string().optional(),
  reason: z.string().min(5, "Please briefly describe the reason for your visit."),
});

type MessageValues = z.infer<typeof messageSchema>;
type AppointmentValues = z.infer<typeof appointmentSchema>;

interface ContactFormProps {
  services: { id: string; name: string }[];
  appointmentsEnabled: boolean;
}

export function ContactForm({ services, appointmentsEnabled }: ContactFormProps) {
  const searchParams = useSearchParams();
  const focus = searchParams?.get("focus");
  const defaultService = searchParams?.get("service");

  const [activeTab, setActiveTab] = useState(
    focus === "appointment" && appointmentsEnabled ? "appointment" : "message"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // General Message Form
  const msgForm = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  // Appointment Form
  const aptForm = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      serviceId: defaultService || "",
      reason: "",
    },
  });

  async function onMessageSubmit(data: MessageValues) {
    setIsSubmitting(true);
    try {
      const res = await submitContactMessage(data);
      if (res.error) throw new Error(res.error);
      toast.success("Message sent successfully! We'll be in touch soon.");
      msgForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onAppointmentSubmit(data: AppointmentValues) {
    setIsSubmitting(true);
    try {
      const res = await submitAppointment(data);
      if (res.error) throw new Error(res.error);
      toast.success("Appointment request received! We will call you shortly to confirm.");
      aptForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-brand-50 p-1 mb-8 rounded-full">
          <TabsTrigger
            value="message"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm font-medium transition-all"
          >
            General Inquiry
          </TabsTrigger>
          {appointmentsEnabled && (
            <TabsTrigger
              value="appointment"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm font-medium transition-all"
            >
              Book Appointment
            </TabsTrigger>
          )}
        </TabsList>

        {/* Message Tab */}
        <TabsContent value="message" className="animate-fade-in outline-none">
          <form onSubmit={msgForm.handleSubmit(onMessageSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="msg-name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="msg-name" placeholder="John Doe" disabled={isSubmitting} {...msgForm.register("name")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                {msgForm.formState.errors.name && <p className="text-xs text-red-500">{msgForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg-email">Email Address <span className="text-red-500">*</span></Label>
                <Input id="msg-email" type="email" placeholder="john@example.com" disabled={isSubmitting} {...msgForm.register("email")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                {msgForm.formState.errors.email && <p className="text-xs text-red-500">{msgForm.formState.errors.email.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="msg-phone">Phone Number (Optional)</Label>
                <Input id="msg-phone" type="tel" placeholder="+91" disabled={isSubmitting} {...msgForm.register("phone")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg-subject">Subject <span className="text-red-500">*</span></Label>
                <Input id="msg-subject" placeholder="How can we help?" disabled={isSubmitting} {...msgForm.register("subject")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                {msgForm.formState.errors.subject && <p className="text-xs text-red-500">{msgForm.formState.errors.subject.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="msg-body">Message <span className="text-red-500">*</span></Label>
              <Textarea
                id="msg-body"
                placeholder="Please describe your inquiry in detail..."
                className="min-h-[150px] rounded-xl border-brand-border focus-visible:ring-brand-primary resize-y"
                disabled={isSubmitting}
                {...msgForm.register("message")}
              />
              {msgForm.formState.errors.message && <p className="text-xs text-red-500">{msgForm.formState.errors.message.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white rounded-pill px-8 shadow-button">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Send Message</>
              )}
            </Button>
          </form>
        </TabsContent>

        {/* Appointment Tab */}
        {appointmentsEnabled && (
          <TabsContent value="appointment" className="animate-fade-in outline-none">
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-3">
              <CalendarCheck className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <p>Submitting this form does not confirm your appointment immediately. Our staff will call you shortly to confirm availability based on your preferred time.</p>
            </div>

            <form onSubmit={aptForm.handleSubmit(onAppointmentSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apt-name">Patient Name <span className="text-red-500">*</span></Label>
                  <Input id="apt-name" placeholder="John Doe" disabled={isSubmitting} {...aptForm.register("name")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                  {aptForm.formState.errors.name && <p className="text-xs text-red-500">{aptForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apt-phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="apt-phone" type="tel" placeholder="+91" disabled={isSubmitting} {...aptForm.register("phone")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                  {aptForm.formState.errors.phone && <p className="text-xs text-red-500">{aptForm.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apt-email">Email Address (Optional)</Label>
                  <Input id="apt-email" type="email" placeholder="john@example.com" disabled={isSubmitting} {...aptForm.register("email")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apt-service">Related Service (Optional)</Label>
                  <select
                    id="apt-service"
                    disabled={isSubmitting}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                    {...aptForm.register("serviceId")}
                  >
                    <option value="">-- Select a Service --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apt-date">Preferred Date <span className="text-red-500">*</span></Label>
                  <Input id="apt-date" type="date" min={new Date().toISOString().split('T')[0]} disabled={isSubmitting} {...aptForm.register("date")} className="rounded-xl border-brand-border focus-visible:ring-brand-primary" />
                  {aptForm.formState.errors.date && <p className="text-xs text-red-500">{aptForm.formState.errors.date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apt-time">Preferred Time (Optional)</Label>
                  <select
                    id="apt-time"
                    disabled={isSubmitting}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                    {...aptForm.register("time")}
                  >
                    <option value="">-- Any Time --</option>
                    <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                    <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                    <option value="Evening (After 4PM)">Evening (After 4PM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apt-reason">Reason for Visit <span className="text-red-500">*</span></Label>
                <Textarea
                  id="apt-reason"
                  placeholder="Please briefly describe your symptoms or reason for visit..."
                  className="min-h-[100px] rounded-xl border-brand-border focus-visible:ring-brand-primary resize-y"
                  disabled={isSubmitting}
                  {...aptForm.register("reason")}
                />
                {aptForm.formState.errors.reason && <p className="text-xs text-red-500">{aptForm.formState.errors.reason.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white rounded-pill px-8 shadow-button">
                 {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting...</>
                ) : (
                  <><CalendarCheck className="mr-2 h-4 w-4" /> Request Appointment</>
                )}
              </Button>
            </form>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
