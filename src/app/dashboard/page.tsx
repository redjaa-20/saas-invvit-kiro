import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "USER":
      redirect("/dashboard/user");
    case "CLIENT":
      redirect("/dashboard/client");
    default:
      redirect("/login");
  }
}
