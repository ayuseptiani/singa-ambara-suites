"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // Menggunakan Axios

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cek Token & Ambil Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchBookings = async () => {
      try {
        // Axios Call (Header Token otomatis dari interceptor)
        const res = await api.get('/my-bookings');
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  // 2. FUNGSI LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    
    alert("Anda telah berhasil logout.");
    router.push("/");
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1619] text-white p-20 text-center">Memuat riwayat...</div>;

  return (
    <div className="min-h-screen bg-[#0F1619] p-8 md:p-20 text-gray-200">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER: Judul & Tombol Action */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-700 pb-4 gap-4">
            <div>
                <h1 className="text-3xl font-serif text-[#D4AF37]">Riwayat Pemesanan</h1>
                <p className="text-sm text-gray-400 mt-1">Daftar liburan impian Anda.</p>
            </div>
            
            {/* Tombol Pesan Lagi & Logout */}
            <div className="flex gap-3">
                <Link href="/rooms" className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition text-white">
                    + Pesan Lagi
                </Link>
                <button 
                    onClick={handleLogout}
                    className="text-sm bg-red-900/40 hover:bg-red-900/80 text-red-200 border border-red-800/50 px-4 py-2 rounded transition"
                >
                    Logout
                </button>
            </div>
        </div>

        {/* CONTENT: Daftar Booking */}
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-[#1A2225] rounded-xl border border-gray-800">
            <p className="text-gray-400 mb-4">Belum ada riwayat booking.</p>
            <Link href="/rooms" className="text-[#D4AF37] hover:underline">Cari Kamar Sekarang &rarr;</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <div key={booking.id} className="bg-[#1A2225] p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-6 shadow-lg hover:border-[#D4AF37] transition duration-300">
                {/* Gambar Kamar */}
                {booking.room && (
                    <div className="w-full md:w-48 h-32 bg-gray-800 rounded-lg overflow-hidden relative shrink-0">
                        <img src={booking.room.image} alt={booking.room.name} className="w-full h-full object-cover" />
                    </div>
                )}
                
                {/* Detail Info */}
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white font-serif">{booking.room?.name || 'Kamar Tidak Dikenal'}</h3>
                        <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded border border-green-800 uppercase tracking-widest">
                            {booking.status}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mt-2">
                        <div>
                            <p className="uppercase text-xs tracking-widest text-gray-600">Check-In</p>
                            <p className="text-white">{booking.check_in}</p>
                        </div>
                        <div>
                            <p className="uppercase text-xs tracking-widest text-gray-600">Check-Out</p>
                            <p className="text-white">{booking.check_out}</p>
                        </div>
                    </div>
                </div>

                {/* Harga Total */}
                <div className="border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center items-end min-w-[150px]">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Bayar</p>
                    <p className="text-2xl font-serif text-[#D4AF37]">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(booking.total_price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{booking.total_days} Malam</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}