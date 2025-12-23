"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/AdminSidebar";
import api from "@/lib/axios"; // Menggunakan Axios

// --- TIPE DATA ---
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

type Booking = {
  id: number;
  guest_name: string;
  phone_number: string;
  check_in: string;
  check_out: string;
  payment_method: string;
  status: string; 
  total_price: number;
  room_id: number; 
  room: { name: string };
};

type Room = {
  id: number;
  name: string;
  image: string;
  price: number;
  total_units: number;
  capacity: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");

  // STATE EDIT STOK
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({ price: 0, total_units: 0, capacity: 0 });
  const [isSaving, setIsSaving] = useState(false);

  // STATE MONITORING
  const [monitorDate, setMonitorDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      // Axios Calls (Token otomatis di-inject dari localStorage)
      
      // Fetch Bookings
      const resBooking = await api.get('/admin/bookings');
      setBookings(resBooking.data);

      // Fetch Rooms
      const resRooms = await api.get('/rooms');
      const roomData = resRooms.data;
      const formattedRooms = roomData.map((r: any) => ({
             ...r, 
             price: Number(r.price),
             total_units: Number(r.total_units),
             capacity: Number(r.capacity)
      }));
      setRooms(formattedRooms);

      // Fetch Users (Super Admin Only)
      // Gunakan try-catch terpisah agar kalau forbidden (403), dashboard tetap jalan
      try {
          const resUsers = await api.get('/admin/users');
          setUsers(resUsers.data);
      } catch (e) {
          // Ignore 403 error for regular admin
          setUsers([]);
      }

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 401) {
          localStorage.clear();
          router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. HELPER & HANDLERS

  // A. Ketersediaan Kamar
  const getRoomAvailability = (roomId: number, totalPhysical: number) => {
     const activeBookings = bookings.filter(b => {
        const isSameRoom = b.room_id === roomId || (b.room && b.room.name === rooms.find(r => r.id === roomId)?.name); 
        const isValidStatus = ['confirmed', 'paid', 'checked_in'].includes(b.status);
        
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        const current = new Date(monitorDate);
        
        const isDateOccupied = current >= checkIn && current < checkOut;
        return isSameRoom && isValidStatus && isDateOccupied;
     });
     return { occupied: activeBookings.length, available: totalPhysical - activeBookings.length };
  };

  // B. Update Status Booking
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Update status booking #${id}?`)) return;
    try {
        await api.put(`/admin/bookings/${id}`, { status: newStatus });
        fetchData();
    } catch (err) {
        alert("Gagal update status");
    }
  };

  // C. Edit Kamar
  const handleEditRoomClick = (room: Room) => {
      setEditingRoom(room);
      setFormData({ price: room.price, total_units: room.total_units, capacity: room.capacity });
  };

  const handleSaveRoom = async () => {
      if (!editingRoom) return;
      setIsSaving(true);
      try {
          await api.put(`/admin/rooms/${editingRoom.id}`, formData);
          alert("Data kamar berhasil diupdate!");
          setEditingRoom(null);
          fetchData();
      } catch (error) { 
          console.error(error);
          alert("Gagal update kamar.");
      } finally { 
          setIsSaving(false); 
      }
  };

  // D. Manage Users (Super Admin)
  const handleChangeRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if(!confirm(`Ubah role user ini menjadi ${newRole}?`)) return;
    
    try {
        await api.put(`/admin/users/${id}/role`, { role: newRole });
        alert("Role berhasil diubah!");
        fetchData(); 
    } catch (err) {
        alert("Gagal mengubah role. Anda mungkin bukan Super Admin.");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if(!confirm("Yakin ingin menghapus user ini permanen?")) return;
    
    try {
        await api.delete(`/admin/users/${id}`);
        fetchData();
    } catch (err) {
        alert("Gagal menghapus user.");
    }
  };

  // FILTER LIST
  const getFilteredBookings = () => {
    let filtered = bookings;
    if (activeTab === 'checkin') filtered = bookings.filter(b => b.status === 'confirmed');
    else if (activeTab === 'checkout') filtered = bookings.filter(b => b.status === 'checked_in');
    else if (activeTab === 'payments') filtered = bookings.filter(b => b.status !== 'cancelled');
    if (searchTerm) {
        filtered = filtered.filter(b => 
            b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toString().includes(searchTerm)
        );
    }
    return filtered;
  };
  const displayedBookings = getFilteredBookings();

  if (isLoading) return <div className="pl-64 pt-20 text-center text-gray-500">Memuat Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 ml-64 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 capitalize">
                    {activeTab === 'dashboard' ? 'Overview Dashboard' : 
                     activeTab === 'users' ? 'Manajemen Pengguna' :
                     activeTab === 'checkin' ? 'Jadwal Check-In' :
                     activeTab === 'checkout' ? 'Jadwal Check-Out' :
                     activeTab === 'rooms' ? 'Monitoring Stok & Harga' : 'Laporan Keuangan'}
                </h2>
                <p className="text-gray-500 mt-1">
                    {activeTab === 'users' ? 'Atur role user dan admin.' : 'Ringkasan data hotel Anda.'}
                </p>
            </div>
            {activeTab !== 'dashboard' && activeTab !== 'rooms' && activeTab !== 'users' && (
                <div className="relative">
                    <input type="text" placeholder="Cari data..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:outline-none text-sm w-64"/>
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
            )}
        </div>

        {/* --- KONTEN DINAMIS --- */}

        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <p className="text-gray-500 text-xs font-bold uppercase">Pendapatan</p>
                    <h3 className="text-2xl font-bold mt-1">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(bookings.filter(b=>b.status!=='cancelled').reduce((a,b)=>a+b.total_price,0))}
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#D4AF37]">
                    <p className="text-gray-500 text-xs font-bold uppercase">Check-In Hari Ini</p>
                    <h3 className="text-2xl font-bold mt-1">{bookings.filter(b=>b.status==='confirmed').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p className="text-gray-500 text-xs font-bold uppercase">Kamar Terisi</p>
                    <h3 className="text-2xl font-bold mt-1">{bookings.filter(b=>b.status==='checked_in').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <p className="text-gray-500 text-xs font-bold uppercase">Total User</p>
                    <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
                </div>
            </div>
        )}

        {/* 2. USER MANAGEMENT (SUPER ADMIN ONLY) */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                        <tr><th className="p-4">Nama</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Terdaftar</th><th className="p-4 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {users.length > 0 ? users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-bold text-gray-800">{u.name}</td>
                                <td className="p-4 text-gray-600">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {u.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    {u.role !== 'super_admin' && (
                                        <>
                                            <button onClick={() => handleChangeRole(u.id, u.role)} className={`px-3 py-1 rounded text-xs font-bold text-white transition ${u.role === 'user' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                                                {u.role === 'user' ? '⬆️ Promote Admin' : '⬇️ Demote User'}
                                            </button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition">
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                    {u.role === 'super_admin' && <span className="text-xs text-gray-400 italic">Master</span>}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Anda tidak memiliki akses atau data kosong.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* 3. KELOLA KAMAR */}
        {activeTab === 'rooms' && (
             <div className="space-y-6">
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <span className="font-bold text-gray-700">📅 Cek Ketersediaan Tanggal:</span>
                    <input type="date" value={monitorDate} onChange={(e) => setMonitorDate(e.target.value)} className="border border-gray-300 rounded p-2 focus:border-[#D4AF37] outline-none"/>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => {
                        const { occupied, available } = getRoomAvailability(room.id, room.total_units);
                        return (
                            <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 group">
                                <div className="relative h-48 w-full">
                                    <Image src={room.image} alt={room.name} fill className="object-cover"/>
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">ID: {room.id}</div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold mb-4 text-[#0F1619]">{room.name}</h3>
                                    <div className="space-y-3 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-center border-b pb-2"><span>Harga:</span><span className="font-bold text-[#D4AF37]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price)}</span></div>
                                        <div className="flex justify-between items-center text-gray-500"><span>Aset Fisik:</span><span className="font-bold">{room.total_units} Unit</span></div>
                                        <div className="flex justify-between items-center text-red-500"><span>Terisi:</span><span className="font-bold">-{occupied}</span></div>
                                        <div className="flex justify-between items-center pt-2 border-t mt-2"><span className="font-bold">SISA:</span><span className={`font-bold px-3 py-1 rounded ${available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{available} Unit</span></div>
                                    </div>
                                    <button onClick={() => handleEditRoomClick(room)} className="w-full bg-[#1A2225] text-white py-2 rounded font-bold hover:bg-[#D4AF37] transition shadow-md">✏️ Edit</button>
                                </div>
                            </div>
                        );
                    })}
                 </div>
             </div>
        )}

        {/* 4. TABEL BOOKING */}
        {activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'rooms' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                        <tr><th className="p-4">ID & Tamu</th><th className="p-4">Kamar</th><th className="p-4">Jadwal</th><th className="p-4">Status</th><th className="p-4 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {displayedBookings.length > 0 ? displayedBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50 transition">
                                <td className="p-4"><span className="font-bold block text-gray-900">{b.guest_name}</span><span className="text-xs text-gray-500">#{b.id} • {b.phone_number}</span></td>
                                <td className="p-4"><span className="block font-medium">{b.room?.name}</span>
                                {activeTab==='payments'&&<div className="text-xs text-[#D4AF37] font-bold mt-1">{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(b.total_price)}</div>}</td>
                                <td className="p-4 whitespace-nowrap text-xs"><div>IN <b>{b.check_in}</b></div><div>OUT <b>{b.check_out}</b></div></td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${b.status==='confirmed'?'bg-yellow-50 text-yellow-700':b.status==='checked_in'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{b.status.replace('_',' ')}</span></td>
                                <td className="p-4 text-center">
                                    {activeTab==='checkin'&&b.status==='confirmed'&&<button onClick={()=>handleUpdateStatus(b.id,'checked_in')} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Check-In</button>}
                                    {activeTab==='checkout'&&b.status==='checked_in'&&<button onClick={()=>handleUpdateStatus(b.id,'checked_out')} className="bg-gray-800 text-white px-3 py-1 rounded text-xs">Check-Out</button>}
                                </td>
                            </tr>
                        )) : (<tr><td colSpan={5} className="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>)}
                    </tbody>
                </table>
            </div>
        )}

      </div>

      {/* MODAL EDIT KAMAR */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-4">Edit {editingRoom.name}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold mb-1">Total Aset Fisik</label><input type="number" value={formData.total_units} onChange={(e)=>setFormData({...formData, total_units:parseInt(e.target.value)})} className="w-full p-2 border rounded"/></div>
              <div><label className="block text-sm font-bold mb-1">Harga (IDR)</label><input type="number" value={formData.price} onChange={(e)=>setFormData({...formData, price:parseInt(e.target.value)})} className="w-full p-2 border rounded"/></div>
              <div><label className="block text-sm font-bold mb-1">Kapasitas</label><input type="number" value={formData.capacity} onChange={(e)=>setFormData({...formData, capacity:parseInt(e.target.value)})} className="w-full p-2 border rounded"/></div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={()=>setEditingRoom(null)} className="flex-1 py-2 border rounded font-bold">Batal</button>
              <button onClick={handleSaveRoom} disabled={isSaving} className="flex-1 py-2 bg-[#D4AF37] text-white rounded font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}