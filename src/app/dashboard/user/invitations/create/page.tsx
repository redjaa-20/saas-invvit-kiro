"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function CreateInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    eventTitle: "Pernikahan",
    groomName: "",
    brideName: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    venueAddress: "",
    loveStory: "",
    theme: "classic",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId) {
      toast.error("Invoice ID tidak ditemukan");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, invoiceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Undangan berhasil dibuat!");
      router.push(`/dashboard/user/invitations/${data.id}`);
    } catch (error) {
      toast.error("Gagal membuat undangan");
    } finally {
      setLoading(false);
    }
  };

  if (!invoiceId) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Invoice ID tidak valid. Silakan buat dari halaman invoice.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Undangan Digital</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
            Detail Acara
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Acara
            </label>
            <input
              type="text"
              required
              value={formData.eventTitle}
              onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Pernikahan / Resepsi"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Mempelai Pria
              </label>
              <input
                type="text"
                required
                value={formData.groomName}
                onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Ahmad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Mempelai Wanita
              </label>
              <input
                type="text"
                required
                value={formData.brideName}
                onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Fatimah"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Acara
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu Acara
              </label>
              <input
                type="text"
                required
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="10:00 - 14:00 WIB"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempat / Venue
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Gedung Serbaguna"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Venue
            </label>
            <textarea
              value={formData.venueAddress}
              onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              rows={2}
              placeholder="Jl. Contoh No. 123, Kota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Love Story (Opsional)
            </label>
            <textarea
              value={formData.loveStory}
              onChange={(e) => setFormData({ ...formData, loveStory: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="Cerita perjalanan cinta kedua mempelai..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tema
            </label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="rustic">Rustic</option>
              <option value="elegant">Elegant</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Membuat..." : "Buat Undangan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


export default function CreateInvitationPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Memuat...</div>}>
      <CreateInvitationForm />
    </Suspense>
  );
}
