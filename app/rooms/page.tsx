"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 

// Definisikan Tipe Data dari API Laravel
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

export default function RoomsPage() {
  const router = useRouter(); 

  // STATE
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 1. FETCH DATA DARI LARAVEL SAAT PAGE LOAD
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${apiUrl}/rooms`);
        
        if (!res.ok) throw new Error("Gagal mengambil data");
        
        const data = await res.json();
        
        // Normalisasi data fasilitas (jaga-jaga jika string)
        const formattedData = data.map((item: any) => ({
            ...item,
            facilities: typeof item.facilities === 'string' ? JSON.parse(item.facilities) : item.facilities
        }));

        setRooms(formattedData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 2. LOGIKA BOOKING PINTAR (SATPAM DIGITAL)
  const handleBookNow = (slug: string) => {
    // Cek Tiket (Token)
    const token = localStorage.getItem("token");

    if (token) {
      // SUDAH LOGIN: Langsung ke Booking
      router.push(`/booking?room=${slug}`);
    } else {
      // BELUM LOGIN: Ke Login dulu
      router.push(`/login?returnUrl=/booking?room=${slug}`);
    }
  };

  // 3. LOGIKA FILTER
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#0F1619] text-white pb-20 pt-28">
      
      {/* SEARCH & FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10 mb-16">
        <div className="bg-[#1A2225] p-6 rounded-xl shadow-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
          
          {/* Input Search */}
          <div className="relative w-full md:flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Cari nama kamar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F1619] text-white pl-12 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#D4AF37] focus:outline-none transition placeholder-gray-500"
            />
          </div>

          {/* Dropdown Filter */}
          <div className="w-full md:w-64">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0F1619] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-[#D4AF37] focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">Semua Kategori</option>
              <option value="Superior">Superior Class</option>
              <option value="Deluxe">Deluxe Class</option>
              <option value="Suite">Executive Suite</option>
            </select>
          </div>

        </div>
      </div>

      {/* LIST KAMAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 space-y-24">
        
        {isLoading ? (
           <div className="text-center py-20 text-gray-400 animate-pulse">
             Mengambil data kamar dari server...
           </div>
        ) : filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <div key={room.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}>
              
              {/* Gambar */}
              <div className="md:w-1/2 w-full h-[350px] md:h-[400px] relative rounded-lg overflow-hidden shadow-2xl border border-white/5 group">
                <Image 
                  src={room.image} 
                  alt={room.name} fill className="object-cover group-hover:scale-105 transition duration-700"
                />
              </div>

              {/* Teks Informasi */}
              <div className="md:w-1/2 text-left space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-[#FFD700] text-4xl font-serif mb-2">{room.name}</h2>
                    <span className="bg-[#1A2225] border border-[#D4AF37] text-[#D4AF37] text-xs px-2 py-1 rounded uppercase tracking-wider">
                      {room.category}
                    </span>
                  </div>
                  {/* Format Harga Rupiah */}
                  <p className="text-xl font-bold text-white">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price)} 
                    <span className="text-sm font-normal text-gray-500">/malam</span>
                  </p>
                </div>
                
                <p className="text-gray-300 leading-relaxed font-light text-lg line-clamp-3">
                  {room.description}
                </p>
                
                {/* List Fasilitas */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 font-mono pt-2">
                  {room.facilities && room.facilities.slice(0, 4).map((fac, i) => (
                    <span key={i}>• {fac}</span>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  {/* === PERUBAHAN UTAMA ADA DI SINI === */}
                  {/* Mengubah href dari /rooms/ menjadi /kamar/ agar sesuai folder */}
                  <Link href={`/kamar/${room.slug}`} className="border border-[#D4AF37] text-[#D4AF37] px-8 py-3 rounded hover:bg-[#D4AF37] hover:text-white transition duration-300 font-bold uppercase text-sm">
                    Detail
                  </Link>
                  
                  {/* TOMBOL BOOKING PINTAR */}
                  <button 
                    onClick={() => handleBookNow(room.slug)}
                    className="bg-[#9F8034] text-white px-8 py-3 rounded hover:bg-[#8A6E2A] transition duration-300 font-bold uppercase text-sm flex items-center justify-center shadow-lg"
                  >
                    Book Now
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Maaf, kamar yang Anda cari tidak ditemukan.</p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
              className="text-[#D4AF37] hover:underline mt-4"
            >
              Reset Pencarian
            </button>
          </div>
        )}

      </div>
    </main>
  );
}