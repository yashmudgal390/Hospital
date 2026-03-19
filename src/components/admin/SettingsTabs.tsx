"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryUploader } from "@/components/admin/GalleryUploader";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { getValidMapEmbedUrl } from "@/lib/utils";
import { Info } from "lucide-react";

interface SettingsTabsProps {
  initialData: any;
}

export function SettingsTabs({ initialData }: SettingsTabsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We are using react-hook-form without Zod here because settings covers ~20 optional text fields.
  const form = useForm({
    defaultValues: initialData || {},
  });

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update settings");
      }
      
      toast.success("Settings updated successfully");
      router.refresh(); // re-fetch layout headers
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Common UI Wrapper for Inputs
  const Field = ({ id, label, placeholder, type = "text", textarea = false }: any) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {textarea ? (
        <Textarea id={id} placeholder={placeholder} className="min-h-[100px] resize-y rounded-xl" {...form.register(id)} />
      ) : (
        <Input id={id} type={type} placeholder={placeholder} className="h-12 rounded-xl" {...form.register(id)} />
      )}
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="animate-fade-in-up pb-20 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Hospital Settings</h1>
          <p className="text-brand-muted">Configure your website's content, contact info, and SEO details.</p>
        </div>
        <Button type="submit" size="lg" className="rounded-pill bg-brand-primary shadow-button text-white px-8" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white border border-brand-border h-14 p-1 rounded-2xl mb-8 flex space-x-2">
          <TabsTrigger value="general" className="rounded-xl flex-1 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-primary data-[state=active]:shadow-none font-medium">General</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl flex-1 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-primary font-medium">Contact & Hours</TabsTrigger>
          <TabsTrigger value="about" className="rounded-xl flex-1 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-primary font-medium">About & Doctor</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl hidden md:block flex-1 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-primary font-medium">SEO & Social</TabsTrigger>
        </TabsList>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border min-h-[500px]">
          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-8 mt-0 outline-none">
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <Field id="clinicName" label="Clinic Name" placeholder="Enter Clinic/Hospital Name" />
                   <Field id="tagline" label="Tagline" placeholder="Briefly describe your mission" />
                   
                   <div className="flex flex-col gap-4 p-4 border border-brand-border bg-brand-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Accept Online Appointments</Label>
                          <p className="text-xs text-brand-muted">Turn off to disable the booking tab on the Contact page.</p>
                        </div>
                        <Switch
                          checked={form.watch("appointmentsEnabled")}
                          onCheckedChange={(val) => form.setValue("appointmentsEnabled", val)}
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                     <Label>Hero Image (Homepage)</Label>
                     <GalleryUploader 
                       folder="settings" 
                       defaultImage={initialData?.heroImageUrl}
                       onUploadSuccess={(url) => form.setValue("heroImageUrl", url)} 
                     />
                     {form.watch("heroImageUrl") && (
                       <input type="hidden" {...form.register("heroImageUrl")} />
                     )}
                   </div>
                </div>
                
                <div className="space-y-6 mt-6 md:mt-0 p-6 bg-brand-50 rounded-2xl border border-brand-border">
                   <h3 className="font-heading font-semibold text-lg text-brand-text mb-4">Homepage Hero Content</h3>
                   <Field id="heroHeadline" label="Headline" placeholder="Main Marketing Headline" />
                   <Field id="heroSubheadline" label="Subheadline" placeholder="Detailed description for the hero section..." textarea />
                   <div className="grid grid-cols-2 gap-4">
                      <Field id="heroCTAText" label="Button Text" placeholder="Book Appointment" />
                      <Field id="heroCTALink" label="Button Link" placeholder="/contact" />
                   </div>
                </div>
             </div>
          </TabsContent>

          {/* CONTACT TAB */}
          <TabsContent value="contact" className="space-y-8 mt-0 outline-none">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <h3 className="font-heading font-semibold text-lg text-brand-text mb-2 border-b border-brand-border pb-2">Primary Contact</h3>
                 <Field id="phone" label="Phone Number" placeholder="+91" />
                 <Field id="email" label="Email Address" placeholder="contact@clinic.com" type="email" />
                 <Field id="whatsapp" label="WhatsApp Number (Optional)" placeholder="+91" />
                 <Field id="address" label="Physical Address" placeholder="123 Health Ave..." textarea />
              </div>

              <div className="space-y-6">
                 <h3 className="font-heading font-semibold text-lg text-brand-text mb-2 border-b border-brand-border pb-2">Location Map</h3>
                 <Field id="mapEmbedUrl" label="Google Maps Embed URL" placeholder="https://www.google.com/maps/embed?pb=..." textarea />
                 
                 <div className="p-4 bg-brand-50 rounded-xl border border-brand-border space-y-3">
                   <div className="flex items-start gap-3">
                     <Info className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                     <div className="text-xs text-brand-muted leading-relaxed">
                       <p className="font-bold text-brand-text mb-1">How to get this URL:</p>
                       <ol className="list-decimal ml-4 space-y-1">
                         <li>Go to Google Maps and find your clinic.</li>
                         <li>Click <strong>Share</strong> &rarr; <strong>Embed a map</strong>.</li>
                         <li>Copy the link inside the <code>src="..."</code> attribute (or just paste the whole tag here).</li>
                       </ol>
                     </div>
                   </div>

                   {/* Live Preview */}
                   {getValidMapEmbedUrl(form.watch("mapEmbedUrl")) ? (
                     <div className="relative aspect-video rounded-lg overflow-hidden border border-brand-border bg-white shadow-inner">
                       <iframe 
                         src={getValidMapEmbedUrl(form.watch("mapEmbedUrl"))!} 
                         width="100%" 
                         height="100%" 
                         style={{ border: 0 }} 
                         loading="lazy"
                       />
                       <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded shadow-sm">VALID EMBED</div>
                     </div>
                   ) : form.watch("mapEmbedUrl") ? (
                     <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-600 font-medium">
                       ✕ Invalid Embed URL. Regular links like <code>maps.app.goo.gl</code> won't work in iframes. Please use the "Embed a map" option on Google Maps.
                     </div>
                   ) : null}
                 </div>
                 
                 <div className="mt-8">
                   <Field id="emergencyBannerText" label="Emergency Banner Text" placeholder="For medical emergencies, call 911 immediately." />
                   <p className="text-xs text-brand-muted mt-1">Leave blank to hide the red banner at the top of the website.</p>
                 </div>
              </div>
            </div>

            <div className="pt-8 border-t border-brand-border">
               <h3 className="font-heading font-semibold text-lg text-brand-text mb-4">Operating Hours</h3>
               <p className="text-sm text-brand-muted mb-8">Set the opening and closing times for each day of the week. Toggle "Closed" for holidays or weekends.</p>
               <HoursEditor 
                 value={form.watch("operatingHours")} 
                 onChange={(val) => form.setValue("operatingHours", val, { shouldDirty: true })} 
               />
               {/* Hidden input to ensure it's registered with the form */}
               <input type="hidden" {...form.register("operatingHours")} />
            </div>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="space-y-8 mt-0 outline-none">
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h3 className="font-heading font-semibold text-lg text-brand-text mb-2 border-b border-brand-border pb-2">Doctor Profile</h3>
                   <div className="flex gap-4 items-end">
                     <div className="flex-1">
                       <Field id="doctorName" label="Doctor Name" placeholder="Dr. Jane Smith" />
                     </div>
                     <div className="flex-1">
                       <Field id="doctorTitle" label="Title/Designation" placeholder="MD, FACP" />
                     </div>
                   </div>
                   <Field id="doctorSpecialty" label="Specialty" placeholder="Internal Medicine" />
                   <Field id="doctorExperience" label="Years of Experience" placeholder="15" type="number" />
                   
                   <div className="space-y-2">
                     <Label>Doctor Profile Photo</Label>
                     <GalleryUploader 
                       folder="settings" 
                       defaultImage={initialData?.doctorPhotoUrl}
                       onUploadSuccess={(url) => form.setValue("doctorPhotoUrl", url)} 
                     />
                     {form.watch("doctorPhotoUrl") && (
                       <input type="hidden" {...form.register("doctorPhotoUrl")} />
                     )}
                   </div>

                   <Field id="doctorQualifications" label="Qualifications List (JSON Array)" placeholder={'["Harvard Medical School", "Board Certified"]'} textarea />
                </div>
                
                <div className="space-y-6">
                   <h3 className="font-heading font-semibold text-lg text-brand-text mb-2 border-b border-brand-border pb-2">Hospital Information</h3>
                   <Field id="aboutText" label="About Us Content" placeholder="Our hospital was founded in..." textarea />
                   <Field id="missionText" label="Mission Statement" placeholder="To provide exceptional care..." textarea />
                   <Field id="visionText" label="Vision Statement" placeholder="To be the leading healthcare provider..." textarea />

                   <div className="space-y-2">
                     <Label>Clinic Interior Photo (/about page)</Label>
                     <GalleryUploader 
                       folder="settings" 
                       defaultImage={initialData?.aboutImageUrl}
                       onUploadSuccess={(url) => form.setValue("aboutImageUrl", url)} 
                     />
                     {form.watch("aboutImageUrl") && (
                       <input type="hidden" {...form.register("aboutImageUrl")} />
                     )}
                   </div>
                </div>
             </div>
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo" className="space-y-8 mt-0 outline-none">
             <div className="max-w-xl space-y-6">
                <h3 className="font-heading font-semibold text-lg text-brand-text mb-2 border-b border-brand-border pb-2">Search Engine Optimization</h3>
                <Field id="metaTitle" label="Global Site Meta Title" placeholder="Healing Medical Center | Modern Healthcare" />
                <Field id="metaDescription" label="Global Site Meta Description" placeholder="Full-service clinic providing..." textarea />
                
                <h3 className="font-heading font-semibold text-lg text-brand-text mt-12 mb-2 border-b border-brand-border pb-2">Social Links</h3>
                <Field id="facebookUrl" label="Facebook URL" placeholder="https://facebook.com/..." />
                <Field id="instagramUrl" label="Instagram URL" placeholder="https://instagram.com/..." />
                <Field id="twitterUrl" label="X (Twitter) URL" placeholder="https://x.com/..." />
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </form>
  );
}
