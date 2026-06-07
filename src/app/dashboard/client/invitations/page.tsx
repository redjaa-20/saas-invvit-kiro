import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ClientInvitationsPage() {
  const session = await getServerSession(authOptions);
  const clientId = session!.user.id;

  const invitations = await prisma.invitation.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { guests: true, rsvps: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Undangan Saya</h1>

      {invitations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            Belum ada undangan yang dibuat untuk Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{inv.eventTitle}</h3>
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
              <p className="text-gray-600 mb-1">
                {inv.groomName} & {inv.brideName}
              </p>
              <p className="text-sm text-gray-500 mb-1">{inv.venue}</p>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(inv.eventDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                | {inv.eventTime}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{inv._count.guests} tamu terdaftar</span>
                <span>{inv._count.rsvps} RSVP masuk</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/client/rsvp?invitationId=${inv.id}`}
                  className="flex-1 text-center px-3 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition"
                >
                  Lihat RSVP
                </Link>
                {inv.isPublished && (
                  <Link
                    href={`/undangan/${inv.slug}`}
                    target="_blank"
                    className="flex-1 text-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
                  >
                    Buka Undangan
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
