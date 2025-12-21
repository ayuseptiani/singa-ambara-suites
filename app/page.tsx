import Link from "next/link";
import Image from "next/image";
import BookingBar from "@/components/BookingBar"; 

export default function Home() {
  return (
    <main className="bg-[#0F1619]">
      
      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pb-20">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop')" }} 
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1215]/80 via-transparent to-[#0B1215]/90"></div>

        {/* Content Hero */}
        <div className="relative z-10 flex flex-col items-center mt-10">
          <div className="mb-6">
            <Image 
              src="/logo-emas.png" 
              alt="Logo Singa Ambara Suites"
              width={150} height={150}
              className="w-auto h-24 md:h-32"
              priority
            />
          </div>
          <h1 className="text-[#FFD700] text-5xl md:text-7xl font-serif tracking-tight mb-2 drop-shadow-lg">
            Singa Ambara
          </h1>
          <p className="text-white text-lg md:text-xl tracking-[0.5em] uppercase mb-12 font-light">
            Suites
          </p>
        </div>
      </section>

      {/* ================= BOOKING BAR ================= */}
      {/* Komponen ini mengambang di antara Hero dan About */}
      <BookingBar />


      {/* ================= ABOUT SECTION (PERBAIKAN GAMBAR) ================= */}
      {/* Menggunakan Layout Grid: Kiri Gambar, Kanan Teks */}
      <section id="about" className="py-20 pt-24 px-4 md:px-10 max-w-7xl mx-auto border-b border-white/5">
        
        {/* Header Section About */}
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] uppercase tracking-widest text-sm font-bold">Discover</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-3 text-white">Tentang Kami</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* FOTO (KIRI) - FIXED: Menambahkan height dan relative agar gambar muncul */}
          <div className="relative h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden shadow-2xl border border-[#D4AF37]/20 group">
            <Image 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop" 
              alt="Luxury Hotel Ambience" 
              fill 
              className="object-cover group-hover:scale-110 transition duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* TEKS (KANAN) */}
          <div className="space-y-6 text-left">
            <h3 className="text-3xl font-serif text-[#FFD700]">
              Kenyamanan & Kemewahan Tak Tertandingi
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg font-light">
              Singa Ambara Suites hadir sebagai destinasi peristirahatan utama di jantung Bali Utara. 
              Kami memadukan arsitektur tradisional Bali dengan sentuhan modern yang elegan, 
              menciptakan suasana yang tenang dan privat bagi setiap tamu.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg font-light">
              Nikmati akses mudah ke berbagai destinasi wisata kota Singaraja dengan fasilitas 
              kamar yang luas dan pelayanan terbaik. Pilihan cerdas untuk kenyamanan maksimal.
            </p>
            
            <div className="pt-4">
               <Link href="/rooms" className="inline-block border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded hover:bg-[#D4AF37] hover:text-white transition duration-300 uppercase tracking-widest text-sm font-bold">
                 Lihat Kamar
               </Link>
            </div>
          </div>

        </div>
      </section>

      
      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-24 px-4 bg-[#0B1215] text-center border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          
          {/* Judul */}
          <h2 className="text-[#FFD700] text-4xl md:text-5xl font-serif mb-10">
            Connect With Us
          </h2>

          {/* Ikon Sosial Media */}
          <div className="flex justify-center gap-6 mb-12 flex-wrap">
            {/* Instagram */}
            <a href="#" className="bg-white text-black p-3 rounded-full hover:bg-[#D4AF37] hover:text-white transition duration-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* Facebook */}
            <a href="#" className="bg-white text-black p-3 rounded-full hover:bg-[#D4AF37] hover:text-white transition duration-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            {/* Youtube */}
            <a href="#" className="bg-white text-black p-3 rounded-full hover:bg-[#D4AF37] hover:text-white transition duration-300">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>
             {/* WhatsApp */}
             <a href="#" className="bg-white text-black p-3 rounded-full hover:bg-[#D4AF37] hover:text-white transition duration-300">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487 2.182.943 2.636.759 3.597.712.961-.048 1.758-.718 2.006-1.412.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
            {/* Tiktok */}
            <a href="#" className="bg-white text-black p-3 rounded-full hover:bg-[#D4AF37] hover:text-white transition duration-300">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.91 6.33-1.8 1.5-4.27 2.06-6.62 1.51-2.35-.55-4.38-2.26-5.46-4.59-1.09-2.32-.88-5.11.53-7.23 1.4-2.12 3.86-3.37 6.43-3.27v4.06c-1.21-.02-2.37.64-2.98 1.69-.61 1.05-.53 2.37.21 3.34.74.97 2.01 1.44 3.21 1.18 1.2-.26 2.09-1.32 2.09-2.55v-13.7h-3.93v-4z"/></svg>
            </a>
          </div>

          {/* Informasi Teks */}
          <div className="text-gray-300 space-y-2">
            <h3 className="text-xl font-bold text-white mb-4">Singa Ambara Suites</h3>
            <p className="font-light">Jl. Udayana No.26, Buleleng, Kota Singaraja ,80228</p>
            <p className="font-light">Telp. (+62) 361283401</p>
            <a href="mailto:reservation@singaambara.com" className="font-light hover:text-[#FFD700] transition">
              reservation@singaambara.com
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}