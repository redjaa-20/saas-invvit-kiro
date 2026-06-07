import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-700">Undangan Digital</h1>
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 text-purple-600 hover:text-purple-800 font-medium"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Daftar
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Buat Undangan Digital<br />
            <span className="text-purple-600">Profesional & Elegan</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Platform SaaS untuk membuat undangan digital pernikahan yang indah.
            Kelola client, buat invoice, dan desain undangan dalam satu tempat.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-purple-600 text-white rounded-lg text-lg font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-purple-300 text-purple-600 rounded-lg text-lg font-medium hover:bg-purple-50 transition"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Kelola Invoice</h3>
            <p className="text-gray-600">
              Buat dan kelola invoice untuk setiap client. Satu invoice, satu undangan digital.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💌</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Desain Undangan</h3>
            <p className="text-gray-600">
              Isi data undangan dengan mudah. Pilih tema, tambahkan foto, dan sesuaikan detail acara.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">RSVP Online</h3>
            <p className="text-gray-600">
              Client dapat memantau RSVP tamu undangan secara real-time melalui dashboard mereka.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
