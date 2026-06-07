"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, ExternalLink, Save } from "lucide-react";
import Link from "next/link";

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  slug: string;
  rsvp: { status: string; numberOfGuests: number; message: string | null } | null;
}

interface Invitation {
  id: string;
  eventTitle: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string | null;
  loveStory: string | null;
  theme: string;
  isPublished: boolean;
  slug: string;
  client: { name: string; email: string };
  invoice: { invoiceNumber: string };
  guests: Guest[];
}

export default function InvitationDetailPage() {
  const { id } = useParams();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", phone: "", email: "" });
  const [showGuestForm, setShowGuestForm] = useState(false);

  const [formData, setFormData] = useState({
    eventTitle: "",
    groomName: "",
    brideName: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    venueAddress: "",
    loveStory: "",
    theme: "classic",
    isPublished: false,
  });

  const fetchInvitation = async () => {
    try {
      const res = await fetch(`/api/invitations/${id}`);
      const data = await res.json();
      setInvitation(data);
      setFormData({
        eventTitle: data.eventTitle,
        groomName: data.groomName,
        brideName: data.brideName,
        eventDate: new Date(data.eventDate).toISOString().split("T")[0],
        eventTime: data.eventTime,
        venue: data.venue,
        venueAddress: data.venueAddress || "",
        loveStory: data.loveStory || "",
        theme: data.theme,
        isPublished: data.isPublished,
      });
    } catch (error) {
      toast.error("Gagal memuat undangan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Undangan berhasil disimpan");
        fetchInvitation();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/invitations/${id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGuest),
      });

      if (res.ok) {
        toast.success("Tamu berhasil ditambahkan");
        setNewGuest({ name: "", phone: "", email: "" });
        setShowGuestForm(false);
        fetchInvitation();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Gagal menambah tamu");
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Hapus tamu ini?")) return;
    try {
      const res = await fetch(`/api/invitations/${id}/guests?guestId=${guestId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Tamu dihapus");
        fetchInvitation();
      }
    } catch (error) {
      toast.error("Gagal menghapus tamu");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Memuat...</div>;
  }

  if (!invitation) {
    return <div className="text-center py-12 text-gray-500">Undangan tidak ditemukan</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Undangan</h1>
          <p className="text-sm text-gray-500">
            Client: {invitation.client.name} | Invoice: {invitation.invoice.invoiceNumber}
          </p>
        </div>
        <div className="flex gap-2">
          {invitation.isPublished && (
            <Link
              href={`/undangan/${invitation.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
            >
              <ExternalLink size={16} />
              Preview
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Detail Acara</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Acara</label>
              <input
                type="text"
                value={formData.eventTitle}
                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mempelai Pria</label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mempelai Wanita</label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                <input
                  type="text"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Venue</label>
              <textarea
                value={formData.venueAddress}
                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Love Story</label>
              <textarea
                value={formData.loveStory}
                onChange={(e) => setFormData({ ...formData, loveStory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
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
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Publish Undangan</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Daftar Tamu ({invitation.guests.length})
              </h2>
              <button
                onClick={() => setShowGuestForm(!showGuestForm)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
              >
                <Plus size={20} />
              </button>
            </div>

            {showGuestForm && (
              <form onSubmit={handleAddGuest} className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                <input
                  type="text"
                  required
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Nama tamu"
                />
                <input
                  type="text"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="No. HP (opsional)"
                />
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  Tambah
                </button>
              </form>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {invitation.guests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Belum ada tamu
                </p>
              ) : (
                invitation.guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                      <p className="text-xs text-gray-500">
                        {guest.rsvp ? (
                          <span
                            className={
                              guest.rsvp.status === "CONFIRMED"
                                ? "text-green-600"
                                : guest.rsvp.status === "DECLINED"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                          >
                            {guest.rsvp.status === "CONFIRMED"
                              ? "Hadir"
                              : guest.rsvp.status === "DECLINED"
                              ? "Tidak Hadir"
                              : "Pending"}
                          </span>
                        ) : (
                          "Belum RSVP"
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Link */}
          {invitation.isPublished && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Link Undangan</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 break-all">
                  /undangan/{invitation.slug}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
