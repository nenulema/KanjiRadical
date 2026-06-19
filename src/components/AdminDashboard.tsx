import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CheckCircle, XCircle, Users, Mail, AlertCircle, ShieldCheck, UserCheck, UserX, Clock, User } from "lucide-react";
import { UserProgress } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface PendingUser {
  id: string;
  email: string | null;
  status: string;
  displayName?: string;
  requestDate?: string;
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<PendingUser[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef); // Fetch all users
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending: PendingUser[] = [];
      const approved: PendingUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProgress;
        const userObj = {
          id: docSnap.id,
          email: data.email || "Tanpa Email",
          status: data.accessStatus || "Unknown",
          displayName: data.displayName || data.email || "Tanpa Nama",
          requestDate: data.requestDate
        };
        if (data.accessStatus === "pending_approval") {
          pending.push(userObj);
        } else if (data.accessStatus === "approved") {
          approved.push(userObj);
        }
      });
      setPendingUsers(pending);
      setApprovedUsers(approved);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string, email: string | null) => {
    setApprovingId(userId);
    try {
      await setDoc(doc(db, "users", userId), { accessStatus: "approved" }, { merge: true });
      
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
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (userId: string, email: string | null) => {
    if (!window.confirm(`PERINGATAN: Yakin ingin MENGHAPUS secara permanen akses untuk ${email}? \nJika mereka login lagi, mereka harus mendaftar/membayar lagi dari awal.`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      alert(`Akun ${email} berhasil dihapus dari database.`);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus pengguna.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
          <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t("admin_title")}</h1>
            <p className="text-slate-400 mt-1">{t("admin_desc")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 px-2 font-bold transition-all ${
              activeTab === "pending"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Menunggu Persetujuan ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-3 px-2 font-bold transition-all ${
              activeTab === "approved"
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Sudah Disetujui ({approvedUsers.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p>Loading customers...</p>
          </div>
        ) : (activeTab === "pending" ? pendingUsers.length === 0 : approvedUsers.length === 0) ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500/50" />
            </div>
            <h3 className="text-xl font-medium text-slate-300 mb-2">Belum ada data</h3>
            <p className="text-slate-500">Tidak ada pengguna dalam kategori ini.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {(activeTab === "pending" ? pendingUsers : approvedUsers).map(user => (
              <div 
                key={user.id} 
                className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 md:p-6 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 border border-slate-700">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate max-w-[200px] md:max-w-xs">{user.displayName}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      {user.displayName !== user.email && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Mail className="w-4 h-4" />
                          <span className="truncate max-w-[180px] md:max-w-xs">{user.email}</span>
                        </div>
                      )}
                      {user.requestDate && (
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Mendaftar pada: {new Date(user.requestDate).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      {activeTab === "pending" ? t("admin_pending_badge") : "VIP Member"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-slate-800 md:border-none">
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={approvingId === user.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 py-2.5 px-4 md:px-5 rounded-xl font-medium transition-colors border border-slate-700 hover:border-rose-900/50 disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Hapus
                  </button>
                  
                  {activeTab === "pending" && (
                    <button
                      onClick={() => handleApprove(user.id, user.email)}
                      disabled={approvingId === user.id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 md:px-6 rounded-xl font-medium transition-all shadow-md hover:shadow-emerald-900/20 disabled:opacity-50"
                    >
                      {approvingId === user.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5" />
                          Approve
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
