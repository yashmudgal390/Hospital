"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is too short"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to login");
      }

      toast.success("Login successful");
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-brand-50 rounded-full mb-6">
          <Stethoscope className="h-10 w-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Welcome Back</h1>
        <p className="text-brand-muted">Sign in to the Clinic Administration Panel</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-card border border-brand-border">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@clinic.com"
              disabled={isSubmitting}
              className="rounded-xl border-brand-border h-12 px-4 focus-visible:ring-brand-primary"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="rounded-xl border-brand-border h-12 px-4 focus-visible:ring-brand-primary"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white rounded-xl h-12 text-base font-semibold shadow-button mt-4"
          >
            {isSubmitting ? (
               <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
            ) : (
               <><Lock className="mr-2 h-5 w-5" /> Sign In securely</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
