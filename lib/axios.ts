import axios from 'axios';

const api = axios.create({
    // Ganti dengan URL Laravel Anda
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.singa-ambara-suites.web.id/api',
    
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    
    withCredentials: true 
});

// --- TAMBAHAN PENTING (INTERCEPTOR) ---
// Kode ini akan berjalan otomatis SEBELUM request dikirim
api.interceptors.request.use((config) => {
    // 1. Cek apakah kita sedang di browser (bukan server)
    if (typeof window !== 'undefined') {
        // 2. Ambil token dari penyimpanan browser
        const token = localStorage.getItem('token');
        
        // 3. Jika token ada, tempelkan ke Header "Authorization"
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;