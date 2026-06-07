import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import RsvpForm from "./RsvpForm";

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      guests: { include: { rsvp: true } },
    },
  });

  if (!invitation || !invitation.isPublished) {
    notFound();
  }

  // Find guest by slug if "to" param is provided
  const guest = to
    ? invitation.guests.find((g) => g.slug === to)
    : null;

  const themeColors: Record<string, { bg: string; accent: string; text: string }> = {
    classic: { bg: "from-amber-50 to-orange-50", accent: "text-amber-800", text: "text-amber-900" },
    modern: { bg: "from-slate-50 to-gray-100", accent: "text-slate-700", text: "text-slate-900" },
    rustic: { bg: "from-green-50 to-emerald-50", accent: "text-green-800", text: "text-green-900" },
    elegant: { bg: "from-purple-50 to-pink-50", accent: "text-purple-800", text: "text-purple-900" },
    minimalist: { bg: "from-white to-gray-50", accent: "text-gray-700", text: "text-gray-900" },
  };

  const theme = themeColors[invitation.theme] || themeColors.classic;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg}`}>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        <p className={`text-sm uppercase tracking-[0.3em] ${theme.accent} mb-4`}>
          {invitation.eventTitle}
        </p>
        <h1 className={`text-5xl md:text-7xl font-serif ${theme.text} mb-4`}>
          {invitation.groomName}
        </h1>
        <p className={`text-2xl ${theme.accent} mb-4`}>&</p>
        <h1 className={`text-5xl md:text-7xl font-serif ${theme.text} mb-8`}>
          {invitation.brideName}
        </h1>
        {guest && (
          <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-3">
            <p className="text-sm text-gray-500">Kepada Yth.</p>
            <p className={`text-lg font-medium ${theme.text}`}>{guest.name}</p>
          </div>
        )}
      </section>

      {/* Event Details */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className={`text-2xl font-serif ${theme.text} mb-8`}>
            Detail Acara
          </h2>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
            <p className={`text-lg font-medium ${theme.text} mb-2`}>
              {new Date(invitation.eventDate).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className={`text-lg ${theme.accent} mb-6`}>{invitation.eventTime}</p>
            <div className="border-t border-gray-200 pt-6">
              <p className={`text-lg font-medium ${theme.text} mb-1`}>
                {invitation.venue}
              </p>
              {invitation.venueAddress && (
                <p className="text-gray-600">{invitation.venueAddress}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Love Story */}
      {invitation.loveStory && (
        <section className="py-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <h2 className={`text-2xl font-serif ${theme.text} mb-6`}>
              Our Story
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {invitation.loveStory}
            </p>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {guest && (
        <section className="py-20 px-6">
          <div className="max-w-lg mx-auto">
            <h2 className={`text-2xl font-serif ${theme.text} mb-6 text-center`}>
              Konfirmasi Kehadiran
            </h2>
            <RsvpForm guest={guest} theme={theme} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 text-center">
        <p className={`text-sm ${theme.accent}`}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami
          <br />
          apabila Bapak/Ibu/Saudara/i berkenan hadir.
        </p>
        <p className={`text-lg font-serif ${theme.text} mt-4`}>
          {invitation.groomName} & {invitation.brideName}
        </p>
      </footer>
    </div>
  );
}
