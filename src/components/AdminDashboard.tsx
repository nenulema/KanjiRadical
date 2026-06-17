import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CheckCircle, XCircle, Users, Mail, AlertCircle } from "lucide-react";
import { UserProgress } from "../types";

interface PendingUser {
  id: string;
  email: string | null;
  status: string;
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("accessStatus", "==", "pending_approval"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: PendingUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProgress;
        users.push({
          id: docSnap.id,
          email: data.email || "Tanpa Email",
          status: data.accessStatus || "Unknown",
        });
      });
      setPendingUsers(users);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string, email: string | null) => {
    try {
      await setDoc(doc(db, "users", userId), { accessStatus: "approved" }, { merge: true });
      
      // Kirim notifikasi email tanpa menunggu (non-blocking)
      if (email && email !== "Tanpa Email") {
        fetch("/api/notify-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email })
        }).catch(err => console.error("Email API failed:", err));
      }
      
      alert(`Berhasil menyetujui akses untuk: ${email}`);
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui akses. Periksa koneksi atau rules Firebase.");
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm("Yakin ingin menolak request ini? Pelanggan akan diminta membayar ulang.")) return;
    try {
      await setDoc(doc(db, "users", userId), { accessStatus: "pending_payment" }, { merge: true });
    } catch (err) {
      console.error(err);
      alert("Gagal menolak request.");
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse flex flex-col items-center">
          <Users className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-slate-400">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
          <Users className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-slate-400 text-sm">Kelola permintaan akses masuk pelanggan</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            Menunggu Persetujuan
            <span className="bg-amber-500/20 text-amber-400 text-xs py-0.5 px-2 rounded-full font-mono">
              {pendingUsers.length}
            </span>
          </h3>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500/50 opacity-50" />
            <p className="text-lg">Tidak ada pelanggan yang mengantre.</p>
            <p className="text-sm mt-1">Semua request sudah ditangani.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {pendingUsers.map((pUser) => (
              <div key={pUser.id} className="p-6 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{pUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Pending Payment Check
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">ID: {pUser.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(pUser.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-400 hover:text-white bg-transparent hover:bg-rose-900/50 border border-rose-900/50 hover:border-rose-500 rounded-lg transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(pUser.id, pUser.email)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Akses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
