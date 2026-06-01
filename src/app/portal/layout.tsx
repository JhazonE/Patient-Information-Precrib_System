import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PatientCare — Book an Appointment",
  description: "Book your clinic appointment online. Fast, easy, and free.",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
