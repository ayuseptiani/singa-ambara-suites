"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios"; // Menggunakan Axios

// Tipe Data Hasil API
type AvailableRoom = {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  capacity: number;
  available_qty: number;
};

export default function BookingBar() {
  const router = useRouter();

  // --- STATE POPUP UI ---
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal Hasil Pencarian

  // --- STATE DATA ---
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(tomorrow);
  
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // --- STATE API & LOADING ---
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AvailableRoom[]>([]);
  const [searchMessage, setSearchMessage] = useState("");

  // --- STATE KALENDER (Navigasi Bulan) ---
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Refs untuk Click Outside
  const dateRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuest(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HELPER: FORMAT DATE TO YYYY-MM-DD (Untuk API) ---
  const formatForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- LOGIKA UTAMA: CEK KETERSEDIAAN KE BACKEND ---
  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setSearchMessage("");
    setResults([]);

    try {
        const checkInStr = formatForApi(startDate);
        const checkOutStr = formatForApi(endDate);
        
        // Menggunakan Axios
        const res = await api.get(`/check-availability?check_in=${checkInStr}&check_out=${checkOutStr}&adults=${adults}&children=${children}`);
        const data = res.data;

        setResults(data.rooms);
        setShowModal(true); // Buka Modal
        
        if (data.rooms.length === 0) {
            setSearchMessage("Maaf, tidak ada kamar tersedia untuk kriteria pencarian Anda.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal terhubung ke server.");
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIKA LANJUT KE BOOKING PAGE ---
  const proceedToBook = (slug: string) => {
    if (!startDate || !endDate) return;
    
    const checkInStr = formatForApi(startDate);
    const checkOutStr = formatForApi(endDate);
    
    // Cek Login (Opsional)
    const token = localStorage.getItem("token");
    if(token) {
        router.push(`/booking?room=${slug}&checkin=${checkInStr}&checkout=${checkOutStr}`);
    } else {
        router.push(`/login?returnUrl=/booking?room=${slug}`);
    }
  };

  // --- LOGIKA KALENDER VISUAL ---
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate < startDate) {
      setStartDate(clickedDate);
    } else {
      setEndDate(clickedDate);
      setShowCalendar(false);
    }
  };
  const getDateStatus = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const now = new Date();
    now.setHours(0,0,0,0);
    if (date < now) return "disabled";
    if (startDate && date.getTime() === startDate.getTime()) return "start";
    if (endDate && date.getTime() === endDate.getTime()) return "end";
    if (startDate && endDate && date > startDate && date < endDate) return "range";
    return "normal";
  };
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysArray = [...Array(firstDay).fill(null), ...Array(daysInMonth).keys()];

  return (
    <>
    <div className="w-full max-w-5xl mx-auto px-4 relative z-40 -mt-24 md:-mt-16">
      <div className="bg-[#1A2225] border border-[#D4AF37]/30 p-4 md:p-6 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
        
        {/* --- 1. DATE PICKER (REAL CALENDAR) --- */}
        <div className="relative w-full md:w-[60%]" ref={dateRef}>
          <div 
            onClick={() => {setShowCalendar(!showCalendar); setShowGuest(false);}}
            className="flex items-center gap-4 bg-[#0F1619] border border-white/10 p-4 rounded-lg cursor-pointer hover:border-[#D4AF37] transition group"
          >
            <span className="text-[#D4AF37] text-2xl group-hover:scale-110 transition">📅</span>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                <span>Check-in</span>
                <span>Check-out</span>
              </div>
              <div className="flex justify-between text-white font-medium text-lg">
                <span>{formatDate(startDate)}</span>
                <span className="text-[#D4AF37]">➝</span>
                <span>{formatDate(endDate)}</span>
              </div>
            </div>
          </div>

          {/* POPUP KALENDER ASLI */}
          {showCalendar && (
            <div className="absolute top-full mt-3 left-0 bg-white text-black p-5 rounded-xl shadow-2xl w-full md:w-[400px] z-50 animate-fadeIn border border-gray-200">
              
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 font-bold">&lt;</button>
                <h4 className="font-bold text-lg text-gray-800">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 font-bold">&gt;</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <span key={d} className="text-gray-400 text-xs font-bold py-2">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {daysArray.map((item, i) => {
                  if (item === null) return <div key={`empty-${i}`}></div>;
                  
                  const day = item + 1;
                  const status = getDateStatus(day);
                  
                  let btnClass = "w-10 h-10 text-sm rounded-full flex items-center justify-center transition ";
                  
                  if (status === "disabled") {
                    btnClass += "text-gray-300 cursor-not-allowed";
                  } else if (status === "start" || status === "end") {
                    btnClass += "bg-[#9F8034] text-white shadow-lg font-bold scale-110";
                  } else if (status === "range") {
                    btnClass += "bg-[#FFF8E1] text-[#9F8034] rounded-none";
                  } else {
                    btnClass += "text-gray-700 hover:bg-gray-100 font-medium";
                  }

                  return (
                    <button 
                      key={day}
                      disabled={status === "disabled"}
                      onClick={() => handleDateClick(day)}
                      className={btnClass}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {!startDate ? "Pilih tanggal Check-in" : !endDate ? "Pilih tanggal Check-out" : `${Math.ceil(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24))} Malam`}
                </span>
                {startDate && endDate && (
                   <button onClick={() => setShowCalendar(false)} className="text-[#9F8034] text-sm font-bold hover:underline">Tutup</button>
                )}
              </div>
            </div>
          )}
        </div>


        {/* --- 2. GUEST SELECTOR --- */}
        <div className="relative w-full md:w-[25%]" ref={guestRef}>
          <div 
            onClick={() => {setShowGuest(!showGuest); setShowCalendar(false);}}
            className="flex items-center gap-3 bg-[#0F1619] border border-white/10 p-4 rounded-lg cursor-pointer hover:border-[#D4AF37] transition h-[82px]"
          >
            <span className="text-[#D4AF37] text-2xl">👤</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Guests</span>
              <span className="text-white font-medium text-sm truncate">{adults} Adult, {children} Child</span>
            </div>
          </div>

          {/* POPUP GUEST COUNTER */}
          {showGuest && (
            <div className="absolute top-full mt-3 left-0 bg-white text-black p-5 rounded-xl shadow-2xl w-[280px] z-50 animate-fadeIn border border-gray-200">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-800">Adults</p>
                  <p className="text-xs text-gray-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#9F8034] hover:text-white transition">-</button>
                  <span className="font-bold w-4 text-center">{adults}</span>
                  <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#9F8034] hover:text-white transition">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold text-gray-800">Children</p>
                  <p className="text-xs text-gray-500">Ages 0 - 12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#9F8034] hover:text-white transition">-</button>
                  <span className="font-bold w-4 text-center">{children}</span>
                  <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#9F8034] hover:text-white transition">+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 3. BUTTON CHECK (TERHUBUNG KE API) --- */}
        <div className="w-full md:w-[15%] h-[82px]">
            <button 
              onClick={handleCheckAvailability}
              disabled={!startDate || !endDate || loading}
              className={`w-full h-full font-bold rounded-lg flex flex-col items-center justify-center transition shadow-lg group 
                ${!startDate || !endDate ? 'bg-gray-600 text-gray-400 cursor-not-allowed border border-white/5' : 'bg-[#9F8034] hover:bg-[#8A6E2A] text-white'}`}
            >
              {loading ? (
                  <span className="animate-pulse">Checking...</span>
              ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm mb-1">Check</span>
                    <span className="text-[10px] font-light opacity-80 group-hover:translate-x-1 transition">
                        {startDate && endDate ? "Availability \u2192" : "Pilih Tanggal"}
                    </span>
                  </>
              )}
            </button>
        </div>

      </div>
    </div>

    {/* === MODAL POP-UP HASIL PENCARIAN === */}
    {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A2225] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4AF37]/30 shadow-2xl relative">
            
            {/* Header Modal */}
            <div className="sticky top-0 bg-[#1A2225] p-6 border-b border-white/10 flex justify-between items-center z-10">
              <div>
                <h3 className="text-2xl font-serif text-[#FFD700]">Hasil Pencarian</h3>
                <p className="text-sm text-gray-400">
                  {formatDate(startDate)} s/d {formatDate(endDate)} • {adults + children} Tamu
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl w-10 h-10 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-6">
              
              {searchMessage && (
                <div className="text-center text-red-400 py-10 text-lg border border-red-500/20 rounded-lg bg-red-500/5">
                  {searchMessage}
                </div>
              )}

              {results.map((room) => (
                <div key={room.id} className="bg-[#0F1619] border border-white/5 rounded-xl overflow-hidden flex flex-col md:flex-row gap-6 hover:border-[#D4AF37]/50 transition duration-300">
                  
                  {/* Gambar Kamar */}
                  <div className="md:w-1/3 h-48 md:h-auto relative">
                      <Image 
                        src={room.image} 
                        alt={room.name} 
                        fill 
                        className="object-cover"
                      />
                      
                      {/* BADGE STOK */}
                      {room.available_qty <= 3 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg z-10">
                            🔥 Tersisa {room.available_qty} Kamar!
                        </div>
                      )}
                      {room.available_qty > 3 && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                            ✅ Tersedia
                        </div>
                      )}
                  </div>

                  {/* Info Kamar */}
                  <div className="flex-1 p-4 md:py-6 md:pr-6 flex flex-col justify-between">
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">{room.name}</h4>
                        <div className="flex gap-4 text-sm text-gray-400 mb-4">
                            <span>👤 Kapasitas: {room.capacity} Orang</span>
                            <span>🛏️ Stok: {room.available_qty} Unit</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                        <div>
                             <p className="text-xs text-gray-500 uppercase">Harga per malam</p>
                             <p className="text-[#D4AF37] text-2xl font-bold">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price)}
                             </p>
                        </div>
                        <button 
                           onClick={() => proceedToBook(room.slug)}
                           className="bg-[#D4AF37] hover:bg-[#B59228] text-white px-6 py-2 rounded font-bold transition shadow-lg text-sm uppercase tracking-wide"
                        >
                            Pilih Kamar
                        </button>
                    </div>
                  </div>

                </div>
              ))}

            </div>
          </div>
        </div>
    )}
    </>
  );
}