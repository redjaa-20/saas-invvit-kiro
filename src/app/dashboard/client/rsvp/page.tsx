import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default async function ClientRsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ invitationId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const clientId = session!.user.id;
  const { invitationId } = await searchParams;

  // Get client's invitations
  const invitations = await prisma.invitation.findMany({
    where: { clientId },
    select: { id: true, eventTitle: true },
  });

  // Get RSVP data for selected invitation or first one
  const selectedInvitationId = invitationId || invitations[0]?.id;

  let guests: any[] = [];
  let rsvpStats = { confirmed: 0, declined: 0, pending: 0, totalGuests: 0 };

  if (selectedInvitationId) {
    guests = await prisma.guest.findMany({
      where: { invitationId: selectedInvitationId },
      include: { rsvp: true },
      orderBy: { createdAt: "desc" },
    });

    const rsvps = await prisma.rsvp.findMany({
      where: { invitationId: selectedInvitationId },
    });

    rsvpStats = {
      confirmed: rsvps.filter((r) => r.status === "CONFIRMED").length,
      declined: rsvps.filter((r) => r.status === "DECLINED").length,
      pending: guests.length - rsvps.length,
      totalGuests: rsvps
        .filter((r) => r.status === "CONFIRMED")
        .reduce((sum, r) => sum + r.numberOfGuests, 0),
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">RSVP</h1>

      {invitations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Belum ada undangan.</p>
        </div>
      ) : (
        <>
          {/* Invitation selector */}
          {invitations.length > 1 && (
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {invitations.map((inv) => (
                  <a
                    key={inv.id}
                    href={`/dashboard/client/rsvp?invitationId=${inv.id}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      inv.id === selectedInvitationId
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {inv.eventTitle}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* RSVP Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="text-xl font-bold text-gray-900">{rsvpStats.confirmed}</p>
                  <p className="text-xs text-gray-500">Hadir</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="text-red-600" />
                <div>
                  <p className="text-xl font-bold text-gray-900">{rsvpStats.declined}</p>
                  <p className="text-xs text-gray-500">Tidak Hadir</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-yellow-600" />
                <div>
                  <p className="text-xl font-bold text-gray-900">{rsvpStats.pending}</p>
                  <p className="text-xs text-gray-500">Belum Konfirmasi</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">#</span>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{rsvpStats.totalGuests}</p>
                  <p className="text-xs text-gray-500">Total Tamu Hadir</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest List with RSVP */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Tamu & RSVP</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama Tamu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jumlah Tamu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pesan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Belum ada tamu yang ditambahkan
                      </td>
                    </tr>
                  ) : (
                    guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {guest.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {guest.phone || guest.email || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {guest.rsvp ? (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                guest.rsvp.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-700"
                                  : guest.rsvp.status === "DECLINED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {guest.rsvp.status === "CONFIRMED"
                                ? "Hadir"
                                : guest.rsvp.status === "DECLINED"
                                ? "Tidak Hadir"
                                : "Pending"}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              Belum RSVP
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {guest.rsvp?.numberOfGuests || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {guest.rsvp?.message || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
