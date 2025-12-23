"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios"; // Menggunakan Axios

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Axios Post
      const res = await api.post('/verify-otp', { email, otp });
      const data = res.data;

      // Simpan Token & Login
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("user_role", data.user.role);
      window.dispatchEvent(new Event("auth-change"));
      
      alert("Akun terverifikasi!");
      router.push("/");

    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1619] flex items-center justify-center p-4">
        <div className="bg-[#1A2225] p-8 rounded-xl max-w-md w-full border border-gray-700">
            <h1 className="text-2xl font-serif text-[#D4AF37] mb-2">Verifikasi OTP</h1>
            <p className="text-gray-400 text-sm mb-6">Masukkan 6 digit kode yang dikirim ke {email}</p>
            
            <form onSubmit={handleVerify} className="space-y-4">
                <input 
                  type="text" maxLength={6} required
                  className="w-full bg-[#0F1619] border border-gray-600 rounded p-3 text-white text-center text-2xl tracking-[0.5em] focus:border-[#D4AF37] outline-none"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                />
                <button disabled={isLoading} className="w-full bg-[#9F8034] text-white py-3 rounded font-bold hover:bg-[#8A6E2A] transition">
                    {isLoading ? "Memverifikasi..." : "Verifikasi Akun"}
                </button>
            </form>
        </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return <Suspense fallback={<div>Loading...</div>}><VerifyOtpForm /></Suspense>;
}