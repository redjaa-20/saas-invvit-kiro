import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function UserInvitationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const invitations = await prisma.invitation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      _count: {
        select: { guests: true, rsvps: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Undangan</h1>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">
            Belum ada undangan. Buat invoice terlebih dahulu, lalu buat undangan setelah invoice lunas.
          </p>
          <Link
            href="/dashboard/user/invoices"
            className="text-purple-600 hover:underline font-medium"
          >
            Ke halaman Invoice
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{inv.eventTitle}</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    inv.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {inv.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {inv.groomName} & {inv.brideName}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Client: {inv.client.name}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {new Date(inv.eventDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{inv._count.guests} tamu</span>
                <span>{inv._count.rsvps} RSVP</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/user/invitations/${inv.id}`}
                  className="flex-1 text-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
                >
                  Edit
                </Link>
                {inv.isPublished && (
                  <Link
                    href={`/undangan/${inv.slug}`}
                    target="_blank"
                    className="flex-1 text-center px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                  >
                    Preview
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
