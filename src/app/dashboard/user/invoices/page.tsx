"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  client: Client;
  invitation: { id: string } | null;
}

export default function UserInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    description: "",
  });

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      toast.error("Gagal memuat data invoice");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formData.clientId,
          amount: parseFloat(formData.amount),
          description: formData.description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      toast.success("Invoice berhasil dibuat");
      setShowModal(false);
      setFormData({ clientId: "", amount: "", description: "" });
      fetchInvoices();
    } catch (error) {
      toast.error("Gagal membuat invoice");
    }
  };

  const handleStatusChange = async (invoiceId: string, status: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success("Status invoice diperbarui");
        fetchInvoices();
      }
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Buat Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Invoice
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Undangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Memuat...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada invoice
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Rp {invoice.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {invoice.invitation ? (
                        <Link
                          href={`/dashboard/user/invitations/${invoice.invitation.id}`}
                          className="text-purple-600 hover:underline"
                        >
                          Lihat
                        </Link>
                      ) : invoice.status === "PAID" ? (
                        <Link
                          href={`/dashboard/user/invitations/create?invoiceId=${invoice.id}`}
                          className="text-purple-600 hover:underline font-medium"
                        >
                          Buat Undangan
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Buat Invoice</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Paket undangan digital premium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Buat Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
