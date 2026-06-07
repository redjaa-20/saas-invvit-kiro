import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestSlug, status, numberOfGuests, message } = body;

    if (!guestSlug || !status) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findUnique({
      where: { slug: guestSlug },
      include: { invitation: true, rsvp: true },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Tamu tidak ditemukan" },
        { status: 404 }
      );
    }

    // Upsert RSVP
    if (guest.rsvp) {
      const updated = await prisma.rsvp.update({
        where: { id: guest.rsvp.id },
        data: {
          status,
          numberOfGuests: numberOfGuests || 1,
          message: message || null,
        },
      });
      return NextResponse.json(updated);
    } else {
      const rsvp = await prisma.rsvp.create({
        data: {
          status,
          numberOfGuests: numberOfGuests || 1,
          message: message || null,
          guestId: guest.id,
          invitationId: guest.invitationId,
        },
      });
      return NextResponse.json(rsvp, { status: 201 });
    }
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan RSVP" },
      { status: 500 }
    );
  }
}
