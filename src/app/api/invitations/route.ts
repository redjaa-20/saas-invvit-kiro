import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function generateSlug(groomName: string, brideName: string): string {
  const base = `${groomName}-${brideName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      invoiceId,
      eventTitle,
      groomName,
      brideName,
      eventDate,
      eventTime,
      venue,
      venueAddress,
      loveStory,
      theme,
    } = body;

    if (!invoiceId || !eventTitle || !groomName || !brideName || !eventDate || !eventTime || !venue) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }

    // Check invoice exists and is paid
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { invitation: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    if (invoice.status !== "PAID") {
      return NextResponse.json(
        { error: "Invoice belum lunas" },
        { status: 400 }
      );
    }

    if (invoice.invitation) {
      return NextResponse.json(
        { error: "Invoice ini sudah memiliki undangan" },
        { status: 400 }
      );
    }

    if (session.user.role !== "ADMIN" && invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const slug = generateSlug(groomName, brideName);

    const invitation = await prisma.invitation.create({
      data: {
        eventTitle,
        groomName,
        brideName,
        eventDate: new Date(eventDate),
        eventTime,
        venue,
        venueAddress: venueAddress || null,
        loveStory: loveStory || null,
        theme: theme || "classic",
        slug,
        invoiceId,
        userId: invoice.userId,
        clientId: invoice.clientId,
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Gagal membuat undangan" },
      { status: 500 }
    );
  }
}
