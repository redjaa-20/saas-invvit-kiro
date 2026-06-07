import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      invitation: { select: { id: true } },
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId, amount, description } = body;

    if (!clientId || !amount) {
      return NextResponse.json(
        { error: "Client dan jumlah harus diisi" },
        { status: 400 }
      );
    }

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: parseFloat(amount),
        description: description || null,
        userId: session.user.id,
        clientId,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Gagal membuat invoice" },
      { status: 500 }
    );
  }
}
