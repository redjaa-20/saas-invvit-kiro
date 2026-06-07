import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
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
    const { name, phone, email } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama tamu harus diisi" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
    }

    // Generate unique slug for guest
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 8)}`;

    const guest = await prisma.guest.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        slug,
        invitationId: id,
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error("Error adding guest:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan tamu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID required" }, { status: 400 });
    }

    await prisma.guest.delete({ where: { id: guestId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { error: "Gagal menghapus tamu" },
      { status: 500 }
    );
  }
}
