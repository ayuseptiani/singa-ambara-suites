"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; 
import api from "@/lib/axios"; // Menggunakan Axios

type Room = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  facilities: string[];
  image: string;
};

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchRoomDetail = async () => {
      try {
        // Axios Call
        const res = await api.get(`/rooms/${slug}`);
        const data = res.data;

        const formattedRoom = {
            ...data,
            price: Number(data.price), 
            facilities: typeof data.facilities === 'string' ? JSON.parse(data.facilities) : data.facilities
        };

        setRoom(formattedRoom);
      } catch (err) {
        console.error("Error fetching room detail:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetail();
  }, [slug]);

  const handleBookNow = () => {
    if (!room) return;
    const token = localStorage.getItem("token");

    if (token) {
      router.push(`/booking?room=${room.slug}`);
    } else {
      router.push(`/login?returnUrl=/booking?room=${room.slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1619] flex items-center justify-center text-white">
        <div className="text-center animate-pulse">
            <h2 className="text-2xl font-serif text-[#D4AF37] mb-2">Singa Ambara Suites</h2>
            <p className="text-gray-400">Memuat detail kamar...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#0F1619] flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p>Kamar tidak ditemukan.</p>
        <Link href="/rooms" className="text-[#D4AF37] hover:underline">&larr; Kembali ke Daftar</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1619] text-gray-200 pb-20">
      
      {/* HEADER IMAGE */}
      <div className="relative h-[60vh] w-full">
        <Image 
          src={room.image}
          alt={room.name} fill className="object-cover" priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1619] via-[#0F1619]/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-10 pb-10 max-w-7xl mx-auto">
          <span className="bg-[#9F8034] text-white px-4 py-1 rounded text-sm font-bold uppercase tracking-widest shadow-lg">
            {room.category}
          </span>
          <h1 className="text-[#FFD700] text-5xl md:text-7xl font-serif mt-4 drop-shadow-lg">
            {room.name}
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* KOLOM KIRI: DESKRIPSI & FASILITAS */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-3xl font-serif text-white mb-4 border-b border-[#D4AF37]/30 pb-2 inline-block">
              Tentang Kamar
            </h2>
            <p className="text-gray-400 leading-relaxed text-lg font-light">
              {room.description}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6 border-b border-[#D4AF37]/30 pb-2 inline-block">
              Fasilitas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {room.facilities && Array.isArray(room.facilities) && room.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#1A2225] p-4 rounded-lg border border-white/5">
                        <span className="text-[#D4AF37] text-2xl">✨</span>
                        <span className="font-medium text-gray-300">{fac}</span>
                    </div>
                ))}
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: HARGA & BOOKING (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A2225] p-8 rounded-xl border border-[#D4AF37]/20 sticky top-24 shadow-2xl">
            <div className="text-center mb-6 border-b border-gray-700 pb-6">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Harga Mulai</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-[#D4AF37] text-4xl font-bold font-serif">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price)}
                </span>
                <span className="text-gray-500 text-sm">/malam</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleBookNow}
                className="block w-full text-center bg-[#9F8034] hover:bg-[#8A6E2A] text-white py-4 rounded font-bold uppercase tracking-widest transition duration-300 shadow-lg cursor-pointer"
              >
                Book Now
              </button>

              <Link href="/rooms" className="block w-full border border-gray-600 text-gray-400 hover:text-white hover:border-white py-4 rounded font-bold uppercase tracking-widest text-center transition duration-300">
                Kembali ke Daftar
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}