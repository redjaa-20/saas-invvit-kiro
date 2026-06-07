# Undangan Digital - SaaS Platform

Platform SaaS untuk pembuatan undangan digital pernikahan dengan sistem multi-level user dan manajemen invoice.

## Fitur

### 3 Level User
- **Admin** - Dashboard admin dengan overview semua data, kelola user, invoice, dan undangan
- **User (Vendor)** - Kelola client, buat invoice, desain undangan digital
- **Client** - Lihat undangan, kelola RSVP tamu

### Alur Kerja
1. User (vendor) membuat akun client
2. User membuat invoice untuk client
3. Setelah invoice lunas (PAID), user bisa membuat undangan digital
4. User mengisi detail undangan (mempelai, tanggal, venue, dll)
5. User menambahkan daftar tamu
6. Undangan dipublish dan bisa diakses publik
7. Tamu mengisi RSVP melalui link undangan
8. Client bisa memantau RSVP melalui dashboardnya

### Fitur Lainnya
- Multi-theme undangan (Classic, Modern, Rustic, Elegant, Minimalist)
- Link personal per tamu dengan RSVP form
- Statistik RSVP real-time
- Responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite (via Prisma ORM 7 + better-sqlite3)
- **Auth**: NextAuth.js 4 (Credentials Provider)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## Setup & Instalasi

```bash
# Clone repository
git clone <repo-url>
cd undangan-digital

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev

# Seed data awal (opsional)
npm run seed

# Jalankan development server
npm run dev
```

## Login Credentials (Seed Data)

| Role   | Email                      | Password   |
|--------|----------------------------|------------|
| Admin  | admin@undangan.com         | admin123   |
| User   | vendor@undangan.com        | user123    |
| Client | ahmad.fatimah@email.com    | client123  |
| Client | andi.sari@email.com        | client123  |

## Struktur URL

- `/` - Landing page
- `/login` - Halaman login
- `/register` - Halaman registrasi
- `/dashboard` - Auto-redirect berdasarkan role
- `/dashboard/admin` - Dashboard Admin
- `/dashboard/user` - Dashboard User/Vendor
- `/dashboard/client` - Dashboard Client
- `/undangan/[slug]` - Halaman undangan publik
- `/undangan/[slug]?to=[guestSlug]` - Undangan personal dengan RSVP

## Development

```bash
npm run dev     # Development server
npm run build   # Production build
npm run seed    # Seed database
```
