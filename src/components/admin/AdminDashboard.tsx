import React, { useState } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  Users, 
  Car, 
  Package, 
  Lock, 
  Wallet, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Server,
  Layers,
  Search
} from 'lucide-react';
import { store } from '../../lib/mockStore';
import { UserProfile, DriverTrip, SenderPackage, MatchAndEscrow } from '../../types';

interface AdminDashboardProps {
  currentUser: UserProfile;
  trips: DriverTrip[];
  packages: SenderPackage[];
  matches: MatchAndEscrow[];
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  trips,
  packages,
  matches,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const allUsers = store.getAllUsers();

  const totalEscrowVolume = matches.reduce((sum, m) => sum + (m.pkg?.emanetPrice || 0), 0);
  const totalHeldInEscrow = matches
    .filter(m => m.paymentStatus === 'held_in_escrow')
    .reduce((sum, m) => sum + (m.pkg?.emanetPrice || 0), 0);
  const totalDriverPayouts = matches
    .filter(m => m.paymentStatus === 'released_to_driver')
    .reduce((sum, m) => sum + (m.pkg?.driverPayout || 0), 0);
  const totalPlatformRevenue = matches
    .filter(m => m.paymentStatus === 'released_to_driver')
    .reduce((sum, m) => sum + (m.pkg?.platformFee || 0), 0);
  const totalSavings = matches.reduce((sum, m) => sum + (m.pkg?.userSavings || 0), 0);

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.tcNo.includes(searchTerm) ||
    u.role.includes(searchTerm)
  );

  const handleReset = () => {
    if (confirm('Tüm platform verilerini (seferler, kargolar, eşleşmeler) başlangıç durumuna sıfırlamak istiyor musunuz?')) {
      store.resetToDefaults();
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Yönetici Başlığı */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#181206] via-[#0E1015] to-[#0A1218] border-2 border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-amber-400 tracking-widest uppercase bg-amber-500/15 px-2 py-0.5 border border-amber-500/30 rounded font-bold">
              YÖNETİM KONSOLU
            </span>
            <span className="font-mono text-xs text-white/50">PLATFORM MASTER DISPATCH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-syne font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            <span>Sistem Operatörü & Admin Denetimi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-grotesk">
            Hoş geldiniz, <strong className="text-amber-300">{currentUser.fullName}</strong>. Tüm ağ metriklerini, kullanıcıları ve finansal escrow havuzunu buradan denetleyebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tüm Verileri Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Finansal & Hacimsel Metrikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="chamfer-card p-5 bg-[#0D0F14] border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold uppercase">
            <span>[TOPLAM HACİM]</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-white">
            {totalEscrowVolume} <span className="text-sm font-mono text-slate-400">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            Platform üzerinden işleme alınan kargo bedeli
          </div>
        </div>

        <div className="chamfer-card p-5 bg-[#0D0F14] border border-purple-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400 font-bold uppercase">
            <span>[HAVUZDA KİLİTLİ]</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-purple-300">
            {totalHeldInEscrow} <span className="text-sm font-mono text-slate-400">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            Teslimat onayı bekleyen aktif escrow bakiyesi
          </div>
        </div>

        <div className="chamfer-card p-5 bg-[#0D0F14] border border-[#CCFF00]/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#CCFF00] font-bold uppercase">
            <span>[SÜRÜCÜYE AKTARILAN]</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-[#CCFF00]">
            {totalDriverPayouts} <span className="text-sm font-mono text-slate-400">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            Sürücülere ödenen net kazanç (%85)
          </div>
        </div>

        <div className="chamfer-card p-5 bg-[#0D0F14] border border-blue-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-blue-400 font-bold uppercase">
            <span>[PLATFORM KAZANCI]</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-blue-400">
            {totalPlatformRevenue} <span className="text-sm font-mono text-slate-400">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            Platform altyapı hizmet geliri (%15)
          </div>
        </div>
      </div>

      {/* Operasyonel Özet Blokları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#FF4500]" />
              <span>AKTİF SÜRÜCÜ SEFERLERİ</span>
            </span>
            <span className="text-white font-bold">{trips.length} Sefer</span>
          </div>
          <div className="text-slate-300 font-grotesk text-xs">
            Toplam boş kapasite: <strong className="text-[#CCFF00]">{trips.reduce((s, t) => s + t.availableCapacityDesi, 0)} Desi</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#00E5FF]" />
              <span>HAVUZDAKİ KARGOLAR</span>
            </span>
            <span className="text-white font-bold">{packages.length} Paket</span>
          </div>
          <div className="text-slate-300 font-grotesk text-xs">
            Eşleşen: <strong>{packages.filter(p => p.status !== 'waiting_match').length}</strong> | Bekleyen: <strong>{packages.filter(p => p.status === 'waiting_match').length}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>KAYITLI KULLANICILAR</span>
            </span>
            <span className="text-white font-bold">{allUsers.length} Üye</span>
          </div>
          <div className="text-slate-300 font-grotesk text-xs">
            %100 T.C. Kimlik doğrulamalı ve güvenli
          </div>
        </div>
      </div>

      {/* Kayıtlı Kullanıcılar Tablosu */}
      <div className="chamfer-card bg-[#0D0F14] border border-white/10 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-syne font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Sistem Kullanıcıları & Yetki Listesi</span>
            </h3>
            <p className="text-xs text-slate-400 font-grotesk mt-0.5">
              Kayıt olan tüm kullanıcıların T.C. Kimlik, rol ve iletişim parametreleri
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İsim, e-posta, T.C. ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#07080A] border border-white/10 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase tracking-wider bg-[#07080A]">
                <th className="py-2.5 px-3">Kullanıcı</th>
                <th className="py-2.5 px-3">T.C. Kimlik No</th>
                <th className="py-2.5 px-3">İletişim</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">T.C. Onay</th>
                <th className="py-2.5 px-3">Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2.5">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={u.fullName}
                      className="w-7 h-7 rounded-lg object-cover border border-white/10"
                    />
                    <div>
                      <div className="font-bold text-white font-syne">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500">{u.id}</div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-300 tracking-wider">{u.tcNo}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-white">{u.email}</div>
                    <div className="text-[10px] text-slate-400">{u.phone}</div>
                  </td>

                  <td className="py-3 px-3">
                    {u.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase text-[10px]">
                        👑 YÖNETİCİ
                      </span>
                    ) : u.role === 'driver' ? (
                      <span className="px-2 py-0.5 rounded bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/40 font-bold uppercase text-[10px]">
                        🚗 SÜRÜCÜ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase text-[10px]">
                        📦 GÖNDERİCİ
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-[#CCFF00] font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DOĞRULANDI</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-amber-400">
                    ★ {u.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
