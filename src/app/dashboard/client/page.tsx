import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Mail, Heart, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const clientId = session!.user.id;

  const [totalInvitations, totalGuests, totalRsvps, confirmedRsvps] =
    await Promise.all([
      prisma.invitation.count({ where: { clientId } }),
      prisma.guest.count({ where: { invitation: { clientId } } }),
      prisma.rsvp.count({ where: { invitation: { clientId } } }),
      prisma.rsvp.count({ where: { invitation: { clientId }, status: "CONFIRMED" } }),
    ]);

  const invitations = await prisma.invitation.findMany({
    where: { clientId },
    include: {
      _count: { select: { guests: true, rsvps: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = [
    {
      label: "Undangan",
      value: totalInvitations,
      icon: <Mail size={24} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Tamu",
      value: totalGuests,
      icon: <Users size={24} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total RSVP",
      value: totalRsvps,
      icon: <Heart size={24} />,
      color: "bg-pink-50 text-pink-600",
    },
    {
      label: "Konfirmasi Hadir",
      value: confirmedRsvps,
      icon: <CheckCircle size={24} />,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invitations */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Undangan Saya</h2>
        </div>
        {invitations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Belum ada undangan. Hubungi vendor Anda untuk informasi lebih lanjut.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invitations.map((inv) => (
              <div key={inv.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{inv.eventTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {inv.groomName} & {inv.brideName} |{" "}
                    {new Date(inv.eventDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {inv._count.guests} tamu | {inv._count.rsvps} RSVP
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/client/rsvp?invitationId=${inv.id}`}
                    className="px-3 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition"
                  >
                    RSVP
                  </Link>
                  {inv.isPublished && (
                    <Link
                      href={`/undangan/${inv.slug}`}
                      target="_blank"
                      className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
                    >
                      Lihat
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
