"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Guest {
  id: string;
  name: string;
  slug: string;
  rsvp: { status: string; numberOfGuests: number; message: string | null } | null;
}

export default function RsvpForm({
  guest,
  theme,
}: {
  guest: Guest;
  theme: { bg: string; accent: string; text: string };
}) {
  const [status, setStatus] = useState(guest.rsvp?.status || "");
  const [numberOfGuests, setNumberOfGuests] = useState(guest.rsvp?.numberOfGuests || 1);
  const [message, setMessage] = useState(guest.rsvp?.message || "");
  const [submitted, setSubmitted] = useState(!!guest.rsvp);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      toast.error("Pilih konfirmasi kehadiran");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestSlug: guest.slug,
          status,
          numberOfGuests,
          message,
        }),
      });

      if (res.ok) {
        toast.success("RSVP berhasil disimpan!");
        setSubmitted(true);
      } else {
        toast.error("Gagal menyimpan RSVP");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (submitted && !loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm text-center">
        <div className="text-4xl mb-4">
          {status === "CONFIRMED" ? "🎉" : "😢"}
        </div>
        <h3 className={`text-xl font-medium ${theme.text} mb-2`}>
          {status === "CONFIRMED" ? "Terima kasih!" : "Sayang sekali"}
        </h3>
        <p className="text-gray-600 mb-4">
          {status === "CONFIRMED"
            ? "Kami senang Anda bisa hadir di acara kami."
            : "Kami memahami. Terima kasih atas ucapannya."}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-purple-600 hover:underline"
        >
          Ubah RSVP
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Apakah Anda bisa hadir?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus("CONFIRMED")}
            className={`py-3 rounded-xl font-medium transition ${
              status === "CONFIRMED"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Ya, Hadir
          </button>
          <button
            type="button"
            onClick={() => setStatus("DECLINED")}
            className={`py-3 rounded-xl font-medium transition ${
              status === "DECLINED"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tidak Bisa
          </button>
        </div>
      </div>

      {status === "CONFIRMED" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah Tamu
          </label>
          <select
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} orang
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ucapan & Doa (Opsional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          rows={3}
          placeholder="Tulis ucapan dan doa untuk kedua mempelai..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || !status}
        className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
      >
        {loading ? "Mengirim..." : "Kirim RSVP"}
      </button>
    </form>
  );
}
