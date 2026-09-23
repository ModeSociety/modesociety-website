import AdminApp from "@/components/admin/AdminApp";

export default function AdminPage() {
  return (
    <AdminApp
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
      devBypass={process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_BYPASS === "true"}
    />
  );
}
