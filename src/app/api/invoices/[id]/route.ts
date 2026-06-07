import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { status } = body;

    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui invoice" },
      { status: 500 }
    );
  }
}
