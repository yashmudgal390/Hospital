import { Metadata } from "next";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata: Metadata = {
  title: "New Service | Admin",
};

export default function NewServicePage() {
  return <ServiceForm />;
}
