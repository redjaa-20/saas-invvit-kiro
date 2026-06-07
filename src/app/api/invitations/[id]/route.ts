import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      invoice: { select: { id: true, invoiceNumber: true } },
      guests: { include: { rsvp: true } },
      _count: { select: { guests: true, rsvps: true } },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(invitation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && invitation.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        eventTitle: body.eventTitle,
        groomName: body.groomName,
        brideName: body.brideName,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        eventTime: body.eventTime,
        venue: body.venue,
        venueAddress: body.venueAddress,
        loveStory: body.loveStory,
        theme: body.theme,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating invitation:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui undangan" },
      { status: 500 }
    );
  }
}
