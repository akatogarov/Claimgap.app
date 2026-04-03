import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin — ClaimGap",
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <AdminDashboard />
    </div>
  );
}
