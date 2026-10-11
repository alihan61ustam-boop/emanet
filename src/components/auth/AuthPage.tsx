import React, { useState } from 'react';
import { 
  Package, 
  Car, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Crown,
  Zap,
  Check
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { store, DEMO_ADMIN, DEMO_DRIVER, DEMO_SENDER } from '../../lib/mockStore';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onExploreAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onLoginSuccess,
  onExploreAsGuest 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Giriş Formu State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('admin@emanet.com');
  const [loginPassword, setLoginPassword] = useState<string>('admin');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Kayıt Formu State
  const [selectedRole, setSelectedRole] = useState<UserRole>('sender');
  const [fullName, setFullName] = useState<string>('');
  const [tcNo, setTcNo] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  
  // Sürücüye Özel Alanlar
  const [vehicleInfo, setVehicleInfo] = useState<string>('2023 Fiat Egea (520L Bagaj)');
  const [plateNumber, setPlateNumber] = useState<string>('34 EMN 001');

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);

  // Hızlı Doldur / Hızlı Giriş Butonları
  const handleQuickFill = (user: typeof DEMO_ADMIN, autoSubmit = false) => {
    setActiveTab('login');
    setLoginIdentifier(user.email);
    setLoginPassword(user.password);
    setLoginError(null);

    if (autoSubmit) {
      const res = store.login(user.email, user.password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    const res = store.login(loginIdentifier, loginPassword);
    if (!res.success || !res.user) {
      setLoginError(res.message || 'Giriş yapılamadı.');
      return;
    }

    onLoginSuccess(res.user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!fullName.trim() || !tcNo.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setRegisterError('Lütfen tüm zorunlu alanları eksiksiz doldurunuz.');
      return;
    }

    if (tcNo.replace(/\D/g, '').length !== 11) {
      setRegisterError('T.C. Kimlik Numarası tam olarak 11 haneli olmalıdır.');
      return;
    }

    if (password !== passwordConfirm) {
      setRegisterError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (!acceptTerms) {
      setRegisterError('Lütfen emanet güvenlik protokolü ve kullanım şartlarını onaylayınız.');
      return;
    }

    const res = store.register({
      fullName,
      tcNo: tcNo.replace(/\D/g, ''),
      email,
      phone,
      password,
      role: selectedRole,
      vehicleInfo: selectedRole === 'driver' ? vehicleInfo : undefined,
      plateNumber: selectedRole === 'driver' ? plateNumber : undefined
    });

    if (!res.success || !res.user) {
      setRegisterError(res.message || 'Kayıt oluşturulamadı.');
      return;
    }

    onLoginSuccess(res.user);
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col justify-between selection:bg-[#FF4500] selection:text-black">
      {/* Üst Ticker Çubuğu */}
      <div className="bg-[#050608] border-b border-white/10 py-1.5 px-4 text-[11px] font-mono flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#FF4500] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"></span>
            <span>EMANET DISPATCH AUTH TERMINAL</span>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-300">T.C. KİMLİK DOĞRULAMALI GÜVENLİ GİRİŞ</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#CCFF00] font-bold">ESCROW SECURE PORTAL</span>
          {onExploreAsGuest && (
            <button
              type="button"
              onClick={onExploreAsGuest}
              className="text-xs text-white hover:text-[#CCFF00] underline font-bold"
            >
              Misafir Olarak İncele →
            </button>
          )}
        </div>
      </div>

      {/* Ana Gövde */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sol Kolon: Endüstriyel Lojistik Tanıtım & Değer Önermesi */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF4500]/15 border border-[#FF4500]/30 text-[#FF4500] font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ŞEHİRLER ARASI P2P KARGO & BAGAJ AĞI</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-syne font-extrabold text-white tracking-tight leading-tight">
              Yolundaki Boş Bagajı Değerlendir, <span className="text-[#CCFF00]">%25 Tasarrufla</span> Kargo Gönder.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-grotesk leading-relaxed">
              Seyahat eden şahsi araç sürücüleri ile güvenilir kargo göndericilerini buluşturan, 
              4 haneli çift OTP ve Escrow güvencesine sahip Türkiye'nin ilk modern paylaşım platformu.
            </p>

            {/* Taktiksel Metrik Blokları */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="chamfer-card p-3.5 bg-[#0D0F14] border border-white/10 space-y-1">
                <div className="text-2xl font-syne font-extrabold text-[#CCFF00]">%25</div>
                <div className="text-[11px] font-mono text-slate-400">Sabit Kargo İndirimi</div>
              </div>

              <div className="chamfer-card p-3.5 bg-[#0D0F14] border border-white/10 space-y-1">
                <div className="text-2xl font-syne font-extrabold text-[#FF4500]">%85</div>
                <div className="text-[11px] font-mono text-slate-400">Sürücü Net Hakedişi</div>
              </div>

              <div className="chamfer-card p-3.5 bg-[#0D0F14] border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-2xl font-syne font-extrabold text-white">±30 KM</div>
                <div className="text-[11px] font-mono text-slate-400">Yol Üstü Güzergah</div>
              </div>
            </div>

            {/* Hızlı Demo Seçenekleri (Admin / Sürücü / Gönderici) */}
            <div className="p-4 rounded-xl bg-[#0F1219] border border-[#FF4500]/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#FF4500] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>TEK TIKLA TEST & HIZLI GİRİŞ YAPIN:</span>
                </span>
                <span className="text-slate-400 text-[10px]">DEMO PROFİLLERİ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_ADMIN, true)}
                  className="p-2.5 rounded-lg bg-[#19150B] hover:bg-[#251E0E] border border-amber-500/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-syne font-bold text-amber-300 group-hover:text-amber-200">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>👑 Yönetici (Admin)</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    admin@emanet.com
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_DRIVER, true)}
                  className="p-2.5 rounded-lg bg-[#07141A] hover:bg-[#0B1E26] border border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-syne font-bold text-cyan-300 group-hover:text-cyan-200">
                    <Car className="w-3.5 h-3.5 text-cyan-400" />
                    <span>🚗 Sürücü Hesabı</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    surucu@emanet.com
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_SENDER, true)}
                  className="p-2.5 rounded-lg bg-[#140F1D] hover:bg-[#1E172B] border border-purple-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-syne font-bold text-purple-300 group-hover:text-purple-200">
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    <span>📦 Kargo Gönderen</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    gonderici@emanet.com
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Giriş & Kayıt Form Konsolu */}
          <div className="lg:col-span-6">
            <div className="chamfer-card bg-[#0D0F14] border-2 border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden">
              
              {/* Form Sekme Başlığı */}
              <div className="grid grid-cols-2 border-b border-white/10 bg-[#12151C] font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  className={`py-3.5 text-center font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'login'
                      ? 'bg-[#0D0F14] text-[#CCFF00] border-b-2 border-[#CCFF00]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>[01] GİRİŞ YAP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegisterError(null);
                  }}
                  className={`py-3.5 text-center font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'register'
                      ? 'bg-[#0D0F14] text-[#FF4500] border-b-2 border-[#FF4500]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>[02] HESAP AÇ (KAYIT OL)</span>
                </button>
              </div>

              {/* 1. GİRİŞ YAP FORMU */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-syne font-extrabold text-white">
                      Emanet Terminaline Giriş
                    </h2>
                    <p className="text-xs text-slate-400 font-grotesk">
                      Kayıtlı e-posta, T.C. Kimlik No veya telefon numaranızla giriş yapınız.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-4 font-mono text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>E-posta, T.C. No veya Telefon</span>
                      </label>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="admin@emanet.com veya 11 Haneli T.C."
                        className="w-full px-3.5 py-3 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-sm focus:border-[#CCFF00] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#FF4500]" />
                          <span>Şifre</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Demo şifresi: <strong className="text-white">admin</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-3 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-sm focus:border-[#CCFF00] focus:outline-none pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-700 bg-slate-900 text-[#CCFF00] focus:ring-[#CCFF00]"
                      />
                      <span>Beni Hatırla</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleQuickFill(DEMO_ADMIN, false)}
                      className="text-[#CCFF00] hover:underline font-bold"
                    >
                      Admin Bilgilerini Doldur
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-syne font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(204,255,0,0.35)] active:translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Sisteme Giriş Yap</span>
                  </button>

                  {/* Alt Bilgilendirme */}
                  <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 text-center font-mono text-[11px] text-slate-400">
                    Hesabınız yok mu?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-[#FF4500] hover:underline font-bold"
                    >
                      Hemen ücretsiz hesap oluşturun →
                    </button>
                  </div>
                </form>
              )}

              {/* 2. HESAP AÇ (KAYIT OL) FORMU */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-syne font-extrabold text-white">
                      Yeni Emanet Hesabı Aç
                    </h2>
                    <p className="text-xs text-slate-400 font-grotesk">
                      T.C. Kimlik doğrulamalı güvenli kargo ve sürücü ağına katılın.
                    </p>
                  </div>

                  {registerError && (
                    <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  {/* Rol Seçimi: Sürücü mü Gönderici mi? */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                      Hesap Türünüzü Seçin:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Sürücü Kartı */}
                      <div
                        onClick={() => setSelectedRole('driver')}
                        className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRole === 'driver'
                            ? 'bg-[#181105] border-[#FF4500] shadow-[0_0_15px_rgba(255,69,0,0.25)]'
                            : 'bg-[#07080A] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Car className={`w-5 h-5 ${selectedRole === 'driver' ? 'text-[#FF4500]' : 'text-slate-400'}`} />
                          {selectedRole === 'driver' && <Check className="w-4 h-4 text-[#FF4500] stroke-[3]" />}
                        </div>
                        <div className="font-syne font-bold text-white text-sm">
                          Sürücü Hesabı
                        </div>
                        <div className="text-[11px] text-slate-400 font-grotesk mt-0.5">
                          Aracımla seyahat ederken boş bagajımı paylaşırım
                        </div>
                      </div>

                      {/* Gönderici Kartı */}
                      <div
                        onClick={() => setSelectedRole('sender')}
                        className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRole === 'sender'
                            ? 'bg-[#0F1C12] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                            : 'bg-[#07080A] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Package className={`w-5 h-5 ${selectedRole === 'sender' ? 'text-[#CCFF00]' : 'text-slate-400'}`} />
                          {selectedRole === 'sender' && <Check className="w-4 h-4 text-[#CCFF00] stroke-[3]" />}
                        </div>
                        <div className="font-syne font-bold text-white text-sm">
                          Kargo Gönderici
                        </div>
                        <div className="text-[11px] text-slate-400 font-grotesk mt-0.5">
                          Şehirler arası paket & emanet gönderirim
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Girişleri */}
                  <div className="space-y-3 font-mono text-xs">
                    {/* Ad Soyad */}
                    <div className="space-y-1">
                      <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>Ad Soyad</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Örn: Caner Doğan"
                        className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-grotesk text-xs focus:border-[#FF4500] focus:outline-none"
                        required
                      />
                    </div>

                    {/* T.C. Kimlik No & Nüfus Doğrulama */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                          <span>T.C. Kimlik Numarası (11 Hane)</span>
                        </label>
                        <span className={`text-[10px] font-bold ${tcNo.length === 11 ? 'text-[#CCFF00]' : 'text-slate-500'}`}>
                          {tcNo.length}/11 Hane
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={11}
                        value={tcNo}
                        onChange={e => setTcNo(e.target.value.replace(/\D/g, ''))}
                        placeholder="11 Haneli T.C. No"
                        className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-xs tracking-wider focus:border-[#CCFF00] focus:outline-none"
                        required
                      />
                      <p className="text-[10px] text-slate-500 font-grotesk">
                        * Emanet platformunda tüm işlemler T.C. Nüfus kimlik algoritması ile güvenceye alınır.
                      </p>
                    </div>

                    {/* E-posta & Telefon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>E-posta Adresi</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="ornek@mail.com"
                          className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-xs focus:border-[#FF4500] focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Telefon No</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+90 (5XX) XXX-XXXX"
                          className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-xs focus:border-[#FF4500] focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Sürücüye Özel Alanlar */}
                    {selectedRole === 'driver' && (
                      <div className="p-3 rounded-lg bg-[#120F08] border border-[#FF4500]/30 space-y-3">
                        <div className="text-[10px] font-mono text-[#FF4500] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5" />
                          <span>Sürücü Taşıt Bilgileri</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase">Araç Modeli & Bagaj</label>
                            <input
                              type="text"
                              value={vehicleInfo}
                              onChange={e => setVehicleInfo(e.target.value)}
                              placeholder="Örn: 2022 Passat Sedan"
                              className="w-full px-3 py-2 rounded bg-[#07080A] border border-white/10 text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase">Araç Plakası</label>
                            <input
                              type="text"
                              value={plateNumber}
                              onChange={e => setPlateNumber(e.target.value.toUpperCase())}
                              placeholder="Örn: 34 EMN 001"
                              className="w-full px-3 py-2 rounded bg-[#07080A] border border-white/10 text-white text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Şifre ve Şifre Tekrarı */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          <span>Şifre Belirleyin</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegisterPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-xs focus:border-[#FF4500] focus:outline-none pr-9"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          <span>Şifre Tekrarı</span>
                        </label>
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          value={passwordConfirm}
                          onChange={e => setPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-xs focus:border-[#FF4500] focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Koşul Onayı */}
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={e => setAcceptTerms(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-[#FF4500] focus:ring-[#FF4500] mt-0.5"
                      />
                      <span className="text-[11px] text-slate-400 leading-normal">
                        Emanet Güvenlik Protokolü, 4 haneli OTP şifre akışı ve KVKK aydınlatma metnini kabul ediyorum.
                      </span>
                    </label>
                  </div>

                  {/* Kayıt Butonu */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-lg bg-[#FF4500] hover:bg-[#e03d00] text-black font-syne font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,69,0,0.35)] active:translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Hesabı Oluştur & Sisteme Başla</span>
                  </button>

                  <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 text-center font-mono text-[11px] text-slate-400">
                    Zaten bir hesabınız var mı?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-[#CCFF00] hover:underline font-bold"
                    >
                      Giriş yapın →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alt Footer */}
      <footer className="border-t border-white/10 bg-[#050608] py-6 text-xs text-slate-400 font-mono text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EMANET • 81 İL OTOYOL PAYLAŞIM VE GÜVENLİK SİSTEMİ</span>
          <div className="flex items-center gap-3">
            <span>[T.C. KİMLİK KORUMALI]</span>
            <span>•</span>
            <span className="text-[#CCFF00]">[ESCROW ÇİFT OTP]</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
