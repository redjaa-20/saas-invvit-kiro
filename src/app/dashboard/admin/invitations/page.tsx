import prisma from "@/lib/prisma";

export default async function AdminInvitationsPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      client: true,
      _count: {
        select: { guests: true, rsvps: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Semua Undangan</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acara
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mempelai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tamu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  RSVP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada undangan
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {inv.eventTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv.groomName} & {inv.brideName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv.client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv._count.guests}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inv._count.rsvps}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          inv.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inv.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
