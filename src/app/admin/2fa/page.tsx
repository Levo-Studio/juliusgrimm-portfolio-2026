import { redirect } from "next/navigation";
import { AdminTwoFactorForm } from "@/app/admin/admin-two-factor-form";
import { getPendingTwoFactorUserId, getSessionUser } from "@/server/auth";

export default async function AdminTwoFactorPage(): Promise<React.JSX.Element> {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  const pendingUserId = await getPendingTwoFactorUserId();
  if (!pendingUserId) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-8 text-fg">
      <AdminTwoFactorForm />
    </main>
  );
}
