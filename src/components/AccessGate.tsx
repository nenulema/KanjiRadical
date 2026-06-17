import React, { useState, useEffect } from "react";
import { LogIn, CreditCard, Clock, CheckCircle, ShieldCheck } from "lucide-react";
import { User, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { UserProgress } from "../types";
import { doc, setDoc } from "firebase/firestore";

interface AccessGateProps {
  user: User | null;
  progress: UserProgress;
  onLogin: () => void;
  children: React.ReactNode;
}

export default function AccessGate({ user, progress, onLogin, children }: AccessGateProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const approveId = urlParams.get("approve");

  const isAdmin = user?.email === "nenuhokka@gmail.com";

  // Handle Admin Approval Flow
  const handleApprove = async () => {
    if (!approveId || !isAdmin) return;
    setIsApproving(true);
    try {
      // 1. Fetch user document to get email
      const { getDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", approveId);
      const userSnap = await getDoc(userRef);
      
      let userEmail = "Pelanggan";
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.email) userEmail = userData.email;
        
        // 2. Update status in Firestore
        await setDoc(userRef, { accessStatus: "approved" }, { merge: true });
      }

      // 3. Notify User via backend
      const response = await fetch("/api/notify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail })
      });

      if (response.ok) {
        alert("Persetujuan sukses dan email berhasil dikirim!");
      } else {
        alert("Persetujuan SUKSES tersimpan di database, tetapi gagal mengirim email otomatis (kemungkinan karena App Password Gmail belum diatur dengan benar). Pelanggan tetap sudah bisa mengakses aplikasi.");
      }

      // Selalu hilangkan query param dan reload setelah database sukses
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error approving user. Pastikan Firebase Rules mengizinkan write ke dokumen users lain.");
    } finally {
      setIsApproving(false);
    }
  };

  // Handle User Payment Request
  const handlePaymentConfirm = async () => {
    if (!user) return;
    setIsRequesting(true);
    try {
      // Update local and firestore status to pending_approval and save email
      const updatedProgress = { ...progress, accessStatus: "pending_approval", email: user.email };
      await setDoc(doc(db, "users", user.uid), updatedProgress, { merge: true });
      
      // Notify Admin via backend (tanpa await agar tidak memblokir UI jika email gagal)
      fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName
        })
      }).catch(err => console.error(err));

      // Update local storage so it doesn't revert
      localStorage.setItem("kanji-radical-explorer-progress", JSON.stringify(updatedProgress));

      // Reload window to trigger useEffect in App to fetch new state
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.");
      setIsRequesting(false);
    }
  };

  // 1. Not Logged In
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-indigo-900/50">
            根
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Kanji Explorer</h2>
          <p className="text-slate-400 mb-8 text-sm">
            Silakan masuk dengan akun Google Anda untuk mengakses aplikasi Kanji Radical Explorer.
          </p>
          <button
            onClick={onLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <LogIn className="w-5 h-5" />
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  // 2. Admin viewing approval link
  if (approveId && isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <ShieldCheck className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Approval</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Anda akan menyetujui akses untuk User ID:<br/>
            <code className="bg-slate-800 px-2 py-1 rounded text-xs mt-2 inline-block text-indigo-300">{approveId}</code>
          </p>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {isApproving ? "Menyetujui..." : "Approve Access"}
          </button>
        </div>
      </div>
    );
  }

  // Determine current access status (default to pending_payment if not set)
  const status = progress.accessStatus || "pending_payment";

  // 3. Logged in, Pending Payment
  if (status === "pending_payment") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
          <div className="text-center mb-6">
            <CreditCard className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Akses Premium</h2>
            <p className="text-slate-400 text-sm">
              Untuk mengakses Kanji Radical Explorer, silakan lakukan pembayaran untuk aktivasi akun.
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
            <h3 className="text-slate-300 font-semibold mb-3 text-sm uppercase tracking-wider">Instruksi Pembayaran</h3>
            <ul className="text-slate-400 space-y-3 text-sm">
              <li>1. Transfer senilai <strong className="text-emerald-400 text-lg">Rp 20.000</strong> ke rekening berikut:</li>
              <li className="bg-slate-950/50 p-4 rounded-lg font-mono text-center my-2 border border-slate-800 flex flex-col gap-1">
                <span className="text-indigo-400 font-bold tracking-wider text-base">Bank Mandiri</span>
                <span className="text-2xl text-white font-bold">1360017514867</span>
                <span className="text-sm text-slate-400 uppercase tracking-wide">a.n. Risha Anugerah Nenu</span>
              </li>
              <li>2. Setelah transfer, kirimkan tangkapan layar (bukti pembayaran) ke WhatsApp Admin:</li>
              <li>
                <a 
                  href="https://wa.me/6281241753745?text=Halo%20Admin%2C%20saya%20sudah%20melakukan%20pembayaran%20untuk%20akses%20Kanji%20Explorer." 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Kirim Bukti ke WhatsApp Admin
                </a>
              </li>
              <li className="mt-4 pt-4 border-t border-slate-700/50">3. Terakhir, klik tombol <strong>Saya Sudah Bayar</strong> di bawah ini agar kami segera membuka akses akun Anda.</li>
            </ul>
          </div>

          <button
            onClick={handlePaymentConfirm}
            disabled={isRequesting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            {isRequesting ? (
              "Memproses..."
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Saya Sudah Bayar, Request Akses
              </>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={async () => {
                const updatedProgress = { ...progress, accessStatus: "approved" };
                await setDoc(doc(db, "users", user.uid), updatedProgress, { merge: true });
                localStorage.setItem("kanji-radical-explorer-progress", JSON.stringify(updatedProgress));
                window.location.reload();
              }}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold border border-emerald-400"
            >
              🚀 Buka Kunci (VIP Admin)
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Pending Approval
  if (status === "pending_approval") {
    const handleCancelRequest = async () => {
      if (!user) return;
      try {
        const updatedProgress = { ...progress, accessStatus: "pending_payment" };
        await setDoc(doc(db, "users", user.uid), updatedProgress, { merge: true });
        
        // Update local storage so it doesn't revert
        localStorage.setItem("kanji-radical-explorer-progress", JSON.stringify(updatedProgress));
        
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Gagal membatalkan request. Pastikan koneksi internet aktif.");
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <Clock className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Menunggu Persetujuan</h2>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            Permintaan akses Anda sedang diproses. Admin sedang mengecek pembayaran Anda.<br/><br/>
            Kami akan mengirimkan email ke <strong>{user.email}</strong> setelah akses Anda disetujui.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md w-full"
            >
              Cek Status Terbaru
            </button>
            <button
              onClick={handleCancelRequest}
              className="bg-transparent hover:bg-rose-950/30 text-rose-400 py-2 px-6 rounded-lg text-xs transition-colors border border-transparent hover:border-rose-900/50 w-full"
            >
              Batalkan Request (Ulangi)
            </button>
            
            {isAdmin && (
              <button
                onClick={async () => {
                  const updatedProgress = { ...progress, accessStatus: "approved" };
                  await setDoc(doc(db, "users", user.uid), updatedProgress, { merge: true });
                  localStorage.setItem("kanji-radical-explorer-progress", JSON.stringify(updatedProgress));
                  window.location.reload();
                }}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold border border-emerald-400"
              >
                🚀 Buka Kunci Paksa (VIP Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. Approved - Render the actual app
  return <>{children}</>;
}
