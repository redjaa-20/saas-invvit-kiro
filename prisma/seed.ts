import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@undangan.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@undangan.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // Create User (vendor)
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "vendor@undangan.com" },
    update: {},
    create: {
      name: "Budi Vendor",
      email: "vendor@undangan.com",
      password: userPassword,
      role: "USER",
      phone: "081234567890",
    },
  });
  console.log("User created:", user.email);

  // Create Clients
  const clientPassword = await bcrypt.hash("client123", 12);
  const client1 = await prisma.user.upsert({
    where: { email: "ahmad.fatimah@email.com" },
    update: {},
    create: {
      name: "Ahmad & Fatimah",
      email: "ahmad.fatimah@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "082345678901",
      createdById: user.id,
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "andi.sari@email.com" },
    update: {},
    create: {
      name: "Andi & Sari",
      email: "andi.sari@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "083456789012",
      createdById: user.id,
    },
  });
  console.log("Clients created:", client1.email, client2.email);

  // Create Invoices
  const invoice1 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-00001" },
    update: {},
    create: {
      invoiceNumber: "INV-00001",
      amount: 500000,
      status: "PAID",
      description: "Paket undangan digital premium",
      paidAt: new Date(),
      userId: user.id,
      clientId: client1.id,
    },
  });

  const invoice2 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-00002" },
    update: {},
    create: {
      invoiceNumber: "INV-00002",
      amount: 750000,
      status: "PENDING",
      description: "Paket undangan digital exclusive",
      userId: user.id,
      clientId: client2.id,
    },
  });
  console.log("Invoices created:", invoice1.invoiceNumber, invoice2.invoiceNumber);

  // Create Invitation for paid invoice
  const invitation1 = await prisma.invitation.upsert({
    where: { slug: "ahmad-fatimah-abc123" },
    update: {},
    create: {
      eventTitle: "Pernikahan",
      groomName: "Ahmad Rizki",
      brideName: "Fatimah Zahra",
      eventDate: new Date("2026-08-15"),
      eventTime: "10:00 - 14:00 WIB",
      venue: "Gedung Serbaguna Mawar",
      venueAddress: "Jl. Mawar No. 123, Jakarta Selatan",
      loveStory:
        "Kami bertemu pertama kali di bangku kuliah tahun 2020. Setelah 6 tahun menjalin kasih, akhirnya kami memutuskan untuk melangkah ke jenjang yang lebih serius.\n\nDengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.",
      theme: "elegant",
      isPublished: true,
      slug: "ahmad-fatimah-abc123",
      invoiceId: invoice1.id,
      userId: user.id,
      clientId: client1.id,
    },
  });
  console.log("Invitation created:", invitation1.slug);

  // Create Guests
  const guests = [
    { name: "Bapak Haji Sulaiman", phone: "081111111111" },
    { name: "Ibu Siti Aminah", phone: "081222222222" },
    { name: "Pak RT Sudirman", phone: "081333333333" },
    { name: "Keluarga Besar Anwar", phone: "081444444444" },
    { name: "Teman Kantor - Dian", phone: "081555555555" },
  ];

  for (const g of guests) {
    const slug = `${g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 8)}`;
    const guest = await prisma.guest.create({
      data: {
        name: g.name,
        phone: g.phone,
        slug,
        invitationId: invitation1.id,
      },
    });

    // Some guests have RSVP
    if (g.name.includes("Sulaiman")) {
      await prisma.rsvp.create({
        data: {
          status: "CONFIRMED",
          numberOfGuests: 3,
          message: "Alhamdulillah, kami sekeluarga akan hadir. Semoga menjadi keluarga sakinah mawaddah warahmah.",
          guestId: guest.id,
          invitationId: invitation1.id,
        },
      });
    } else if (g.name.includes("Aminah")) {
      await prisma.rsvp.create({
        data: {
          status: "CONFIRMED",
          numberOfGuests: 2,
          message: "InsyaAllah hadir. Barakallahu lakuma wa baraka alaikuma.",
          guestId: guest.id,
          invitationId: invitation1.id,
        },
      });
    } else if (g.name.includes("Dian")) {
      await prisma.rsvp.create({
        data: {
          status: "DECLINED",
          numberOfGuests: 1,
          message: "Maaf tidak bisa hadir karena ada tugas luar kota. Semoga bahagia selalu!",
          guestId: guest.id,
          invitationId: invitation1.id,
        },
      });
    }
  }
  console.log("Guests and RSVPs created");

  console.log("\n✅ Seed completed!");
  console.log("\nLogin credentials:");
  console.log("  Admin:  admin@undangan.com / admin123");
  console.log("  User:   vendor@undangan.com / user123");
  console.log("  Client: ahmad.fatimah@email.com / client123");
  console.log("  Client: andi.sari@email.com / client123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
