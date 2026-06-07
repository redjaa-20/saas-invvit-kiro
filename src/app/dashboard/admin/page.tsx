import prisma from "@/lib/prisma";
import { Users, FileText, Mail, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const [totalUsers, totalInvoices, totalInvitations, paidInvoices] =
    await Promise.all([
      prisma.user.count(),
      prisma.invoice.count(),
      prisma.invitation.count(),
      prisma.invoice.count({ where: { status: "PAID" } }),
    ]);

  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, client: true },
  });

  const stats = [
    {
      label: "Total User",
      value: totalUsers,
      icon: <Users size={24} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Invoice",
      value: totalInvoices,
      icon: <FileText size={24} />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Undangan",
      value: totalInvitations,
      icon: <Mail size={24} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Invoice Lunas",
      value: paidInvoices,
      icon: <DollarSign size={24} />,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

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

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada invoice
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Rp {invoice.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invoice.status}
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
