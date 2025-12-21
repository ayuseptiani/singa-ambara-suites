"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil parameter dari URL
  const roomSlug = searchParams.get("room");
  const urlCheckIn = searchParams.get("checkin");
  const urlCheckOut = searchParams.get("checkout");

  // --- STATE DATA ---
  const [room, setRoom] = useState<any>(null);
  
  // --- STATE FORM INPUT ---
  const [checkIn, setCheckIn] = useState(urlCheckIn || "");
  const [checkOut, setCheckOut] = useState(urlCheckOut || "");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");

  // 🔥 UPDATE BARU: State Jumlah Kamar
  const [roomCount, setRoomCount] = useState(1); 

  // --- STATE PERHITUNGAN ---
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  
  // --- STATE UI & LOADING ---
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // --- STATE VALIDASI KETERSEDIAAN ---
  const [isAvailable, setIsAvailable] = useState(true); 
  const [isChecking, setIsChecking] = useState(false);  
  const [availabilityMsg, setAvailabilityMsg] = useState(""); 
  const [maxStock, setMaxStock] = useState(5); // Default sementara

  // Helper: Tanggal hari ini
  const getTodayString = () => new Date().toISOString().split("T")[0];

  // 1. FETCH DATA KAMAR & USER
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("user_name");

    if (!token) {
      const returnUrl = encodeURIComponent(`/booking?room=${roomSlug}&checkin=${urlCheckIn}&checkout=${urlCheckOut}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (storedName) setGuestName(storedName);

    const fetchRoom = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${apiUrl}/rooms/${roomSlug}`);
        const data = await res.json();
        if (res.ok) setRoom({ ...data, price: Number(data.price) });
      } catch (error) {
        console.error("Error", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    if (roomSlug) fetchRoom();
  }, [roomSlug, router, urlCheckIn, urlCheckOut]);

  // 2. HITUNG HARGA + CEK KETERSEDIAAN (REAL-TIME)
  useEffect(() => {
    if (checkIn && checkOut && room) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      // Validasi Tanggal Dasar
      if (end <= start) {
        setNights(0);
        setTotalPrice(0);
        setIsAvailable(false);
        setAvailabilityMsg("Tanggal Check-out harus setelah Check-in");
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 0) {
        setNights(diffDays);
        // 🔥 RUMUS BARU: Harga x Malam x Jumlah Kamar
        setTotalPrice(diffDays * room.price * roomCount);
      }

      // --- LOGIKA UTAMA: Cek ke API Backend ---
      const checkRealtimeAvailability = async () => {
         setIsChecking(true);
         setAvailabilityMsg("");
         
         try {
             const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
             const res = await fetch(`${apiUrl}/check-availability?check_in=${checkIn}&check_out=${checkOut}&adults=1&children=0`);
             const data = await res.json();
             
             if(res.ok) {
                 // Cari data kamar ini di daftar hasil API
                 const currentRoomData = data.rooms.find((r: any) => r.id === room.id);
                 
                 if (currentRoomData) {
                     // Simpan info sisa stok real
                     setMaxStock(currentRoomData.available_qty);

                     // Cek apakah permintaan user melebihi sisa stok?
                     if (roomCount <= currentRoomData.available_qty) {
                         setIsAvailable(true);
                         setAvailabilityMsg(""); 
                     } else {
                         setIsAvailable(false);
                         setAvailabilityMsg(`❌ Stok tidak cukup! Hanya sisa ${currentRoomData.available_qty} kamar.`);
                     }
                 } else {
                     // Jika tidak ada di list, berarti habis total (0)
                     setIsAvailable(false);
                     setAvailabilityMsg(`❌ Maaf, ${room.name} SUDAH PENUH di tanggal ini.`);
                     setMaxStock(0);
                 }
             }
         } catch (err) {
             console.error("Gagal cek ketersediaan", err);
         } finally {
             setIsChecking(false);
         }
      };

      const timeoutId = setTimeout(() => {
          checkRealtimeAvailability();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [checkIn, checkOut, room, roomCount]); // 🔥 roomCount jadi trigger ulang

  // 3. PROSES BAYAR
  const handlePaymentAndBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAvailable) {
        alert("Stok tidak tersedia. Mohon kurangi jumlah kamar atau ganti tanggal.");
        return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: room.id,
          check_in: checkIn,
          check_out: checkOut,
          
          // 🔥 UPDATE BARU: Kirim Quantity
          quantity: roomCount, 
          
          total_price: totalPrice,
          guest_name: guestName,
          phone_number: phone,
          payment_method: paymentMethod
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal Booking");

      alert("🎉 Booking Berhasil! Pesanan Anda telah terkonfirmasi.");
      router.push("/my-bookings");

    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) return <div className="text-white text-center pt-32 animate-pulse">Memuat data booking...</div>;
  if (!room) return <div className="text-white text-center pt-32">Kamar tidak ditemukan.</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      {/* BAGIAN KIRI: FORM DATA */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#D4AF37] mb-2">Konfirmasi & Pembayaran</h1>
          <p className="text-gray-400">Lengkapi data diri untuk menyelesaikan reservasi.</p>
        </div>

        <form onSubmit={handlePaymentAndBooking} className="space-y-6">
          
          {/* 1. JADWAL & JUMLAH KAMAR */}
          <div className={`p-6 rounded-xl border transition duration-300 ${!isAvailable ? 'bg-red-900/10 border-red-500' : 'bg-[#1A2225] border-gray-800'}`}>
            <h3 className={`font-bold mb-4 border-b pb-2 flex items-center gap-2 ${!isAvailable ? 'text-red-400 border-red-500/30' : 'text-white border-gray-700'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-black ${!isAvailable ? 'bg-red-500' : 'bg-[#D4AF37]'}`}>1</span>
                Detail Reservasi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest">Check-In</label>
                <input 
                  type="date" required min={getTodayString()} 
                  className="w-full bg-[#0F1619] border border-gray-700 rounded p-3 text-white focus:border-[#D4AF37] outline-none transition"
                  value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest">Check-Out</label>
                <input 
                  type="date" required min={checkIn || getTodayString()} 
                  className="w-full bg-[#0F1619] border border-gray-700 rounded p-3 text-white focus:border-[#D4AF37] outline-none transition"
                  value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* 🔥 INPUT JUMLAH KAMAR */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest">Jml. Kamar</label>
                <select 
                    value={roomCount}
                    onChange={(e) => setRoomCount(parseInt(e.target.value))}
                    className="w-full bg-[#0F1619] border border-gray-700 rounded p-3 text-white focus:border-[#D4AF37] outline-none"
                >
                    <option value={1}>1 Kamar</option>
                    <option value={2}>2 Kamar</option>
                    <option value={3}>3 Kamar</option>
                    <option value={4}>4 Kamar</option>
                    <option value={5}>5 Kamar</option>
                </select>
              </div>
            </div>

            {/* AREA PESAN ERROR / STATUS */}
            {isChecking ? (
                <p className="text-yellow-500 text-sm mt-3 animate-pulse">⏳ Cek stok...</p>
            ) : !isAvailable ? (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-500 rounded text-red-200 text-sm font-bold flex items-center gap-2 animate-in fade-in">
                    ⚠️ {availabilityMsg}
                </div>
            ) : (
                <p className="text-xs text-green-500 mt-2">✓ Tersedia (Max {maxStock} unit)</p>
            )}
          </div>

          {/* 2. DATA TAMU */}
          <div className="bg-[#1A2225] p-6 rounded-xl border border-gray-800">
            <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="bg-[#D4AF37] text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Data Pemesan
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                <input type="text" required placeholder="Sesuai Kartu Identitas"
                  className="w-full bg-[#0F1619] border border-gray-700 rounded p-3 text-white focus:border-[#D4AF37] outline-none placeholder-gray-600 transition"
                  value={guestName} onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest">Nomor WhatsApp</label>
                <input type="tel" required placeholder="Contoh: 081234567890"
                  className="w-full bg-[#0F1619] border border-gray-700 rounded p-3 text-white focus:border-[#D4AF37] outline-none placeholder-gray-600 transition"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 3. METODE PEMBAYARAN */}
          <div className="bg-[#1A2225] p-6 rounded-xl border border-gray-800">
            <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="bg-[#D4AF37] text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                Metode Pembayaran
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['QRIS', 'BCA', 'Mandiri', 'CC'].map((method) => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded border cursor-pointer flex flex-col items-center justify-center text-sm font-bold transition h-20 text-center ${
                    paymentMethod === method 
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' 
                    : 'bg-[#0F1619] border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || nights <= 0 || isChecking || !isAvailable}
            className={`w-full py-5 rounded-lg font-bold text-lg uppercase tracking-widest transition duration-300 shadow-xl
                ${isLoading || !isAvailable || isChecking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' 
                    : 'bg-[#9F8034] hover:bg-[#8A6E2A] text-white'}`}
          >
            {isLoading ? "Memproses..." : 
             isChecking ? "Cek Stok..." :
             !isAvailable ? "Stok Tidak Cukup" :
             `Bayar Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits:0 }).format(totalPrice)}`}
          </button>
        </form>
      </div>

      {/* KANAN: RINGKASAN */}
      <div className="lg:col-span-1">
         <div className="bg-[#1A2225] p-6 rounded-xl border border-[#D4AF37]/20 sticky top-24 shadow-2xl">
            <h3 className="text-[#D4AF37] font-serif text-xl mb-4 border-b border-gray-700 pb-2">Ringkasan Pesanan</h3>
            
            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4 border border-gray-700">
              <Image src={room.image} alt={room.name} fill className="object-cover" />
            </div>

            <h4 className="text-white text-lg font-bold">{room.name}</h4>
            <p className="text-gray-400 text-sm mb-4">{room.category} • Max {room.capacity} Orang</p>

            <div className="space-y-3 text-sm text-gray-300 border-t border-gray-700 pt-4 mt-4">
               <div className="flex justify-between">
                  <span>Harga/malam</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits:0 }).format(room.price)}</span>
               </div>
               <div className="flex justify-between">
                  <span>Durasi</span>
                  <span className="text-white">{nights} Malam</span>
               </div>
               {/* 🔥 INFO JUMLAH KAMAR */}
               <div className="flex justify-between">
                  <span>Jumlah Kamar</span>
                  <span className="font-bold text-[#D4AF37]">x {roomCount} Unit</span>
               </div>

               <div className="flex justify-between text-[#D4AF37] text-xl font-bold pt-4 border-t border-gray-700 mt-2">
                  <span>Total Bayar</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits:0 }).format(totalPrice)}</span>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

// WRAPPER
export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#0F1619] pt-24 pb-20">
      <Suspense fallback={<div className="text-white text-center pt-32">Loading...</div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}