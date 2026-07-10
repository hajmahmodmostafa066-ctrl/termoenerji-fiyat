'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Search, 
  Layers, 
  Building2, 
  BarChart3, 
  Settings, 
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Home,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Info,
  Settings as SettingsIcon,
  Shield,
  Zap,
  Sparkles,
  Crown,
  Star,
  Award,
  Gift,
  Rocket,
  Brain,
  Cpu,
  Database,
  Cloud,
  Server,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  QrCode,
  Scan,
  Share2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  RotateCw,
  RotateCcw,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Grid,
  List as ListIcon,
  Table,
  Columns,
  Rows,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Droplet,
  Brush,
  Eraser,
  Pencil,
  Pen,
  Highlighter,
  Scissors,
  Copy as CopyIcon,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  Check,
  CheckCircle,
  CheckSquare,
  X,
  XCircle,
  XSquare,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Info as InfoIcon,
  HelpCircle as HelpCircleIcon,
  MessageCircle,
  MessageSquare,
  Mail as MailIcon,
  Send,
  Inbox,
  Outbox,
  Archive,
  Trash,
  Trash2,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  File,
  FilePlus,
  FileMinus,
  FileText as FileTextIcon,
  FileCode,
  FileJson,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FilePresentation,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileCheck,
  FileX,
  FileSearch,
  FileScan,
  FileHeart,
  FileStar,
  FileUser,
  FileLock,
  FileKey,
  FileSignature,
  FileClock,
  FileCog,
  FileDigit,
  FileBadge,
  FileAward,
  FileTrophy,
  FileMedal,
  FileCrown,
  FileSparkles,
  FileZap,
  FileRocket,
  FileBrain,
  FileCpu,
  FileDatabase,
  FileCloud,
  FileServer,
  FileCode2,
  FileTerminal,
  FileGitBranch,
  FileGitCommit,
  FileGitPullRequest,
  FileGithub,
  FileTwitter,
  FileLinkedin,
  FileYoutube,
  FileInstagram,
  FileFacebook,
  FileMail,
  FilePhone,
  FileMapPin,
  FileGlobe,
  FileSun,
  FileMoon,
  FileEye,
  FileLock2,
  FileKey2,
  FileShield,
  FileShieldCheck,
  FileShieldX,
  FileShieldAlert,
  FileShieldQuestion,
  FileShieldHeart,
  FileShieldStar,
  FileShieldCrown,
  FileShieldZap,
  FileShieldSparkles,
  FileShieldRocket,
  FileShieldBrain,
  FileShieldCpu,
  FileShieldDatabase,
  FileShieldCloud,
  FileShieldServer,
  FileShieldCode,
  FileShieldTerminal,
  FileShieldGit,
  FileShieldGithub
} from 'lucide-react'

// ============================================================
// BİLEŞENLER
// ============================================================

const StatCard = ({ title, value, icon: Icon, color, subtitle, change, loading }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const colors = {
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400',
    slate: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 hover:border-slate-400'
  }

  const iconColors = {
    emerald: 'text-emerald-400 bg-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    rose: 'text-rose-400 bg-rose-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/20',
    slate: 'text-slate-400 bg-slate-500/20'
  }

  return (
    <div 
      className={`relative bg-gradient-to-br ${colors[color]} rounded-2xl p-6 border transition-all duration-500 overflow-hidden group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => { setIsClicked(true); setTimeout(() => setIsClicked(false), 300) }}
      style={{
        transform: isHovered ? 'scale(1.03) translateY(-4px)' : isClicked ? 'scale(0.97)' : 'scale(1)',
        boxShadow: isHovered ? '0 20px 60px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Işık Halkası */}
      <div 
        className={`absolute -inset-1 bg-gradient-to-r ${colors[color]} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl`}
        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
              {title}
            </p>
            {loading ? (
              <div className="h-10 w-24 bg-slate-700/50 rounded-lg animate-pulse mt-2" />
            ) : (
              <p className="text-4xl font-bold text-white mt-1 tracking-tight">
                {value}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-slate-500">geçen hafta</span>
              </div>
            )}
          </div>
          <div 
            className={`p-4 rounded-2xl ${iconColors[color]} transition-all duration-500`}
            style={{
              transform: isHovered ? 'scale(1.15) rotate(6deg)' : 'scale(1) rotate(0deg)',
            }}
          >
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </div>
    </div>
  )
}

const MenuItem = ({ title, icon: Icon, href, count, color, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const colors = {
    emerald: 'hover:border-emerald-400 group-hover:bg-emerald-500/10',
    blue: 'hover:border-blue-400 group-hover:bg-blue-500/10',
    cyan: 'hover:border-cyan-400 group-hover:bg-cyan-500/10',
    purple: 'hover:border-purple-400 group-hover:bg-purple-500/10',
    amber: 'hover:border-amber-400 group-hover:bg-amber-500/10',
    rose: 'hover:border-rose-400 group-hover:bg-rose-500/10',
    indigo: 'hover:border-indigo-400 group-hover:bg-indigo-500/10',
    slate: 'hover:border-slate-400 group-hover:bg-slate-500/10'
  }

  const iconColors = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    indigo: 'text-indigo-400',
    slate: 'text-slate-400'
  }

  return (
    <div
      onClick={() => {
        setIsClicked(true)
        setTimeout(() => setIsClicked(false), 200)
        onClick()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 ${colors[color]} transition-all duration-300 cursor-pointer overflow-hidden`}
      style={{
        transform: isHovered ? 'translateX(6px)' : isClicked ? 'scale(0.97)' : 'translateX(0)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      <div className="relative z-10 flex items-center gap-4">
        <div 
          className={`p-2.5 rounded-xl bg-slate-700/30 group-hover:scale-110 transition-transform duration-300`}
          style={{ transform: isHovered ? 'scale(1.1) rotate(3deg)' : 'scale(1)' }}
        >
          <Icon className={`h-5 w-5 ${iconColors[color]} transition-colors duration-300`} />
        </div>
        <span className="text-white text-sm font-medium group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 transition-all duration-300">
          {title}
        </span>
      </div>
      
      <div className="relative z-10 flex items-center gap-3">
        <span className="text-sm text-slate-400 font-mono">{count}</span>
        <ChevronRight className={`h-4 w-4 text-slate-500 transition-all duration-300 ${isHovered ? 'translate-x-1 text-emerald-400' : ''}`} />
      </div>
    </div>
  )
}

const TeklifCard = ({ teklif, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const durumColors = {
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const durumLabels = {
    approved: '✅ Aktif',
    pending: '⏳ Beklemede',
    rejected: '❌ Pasif'
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 transition-all duration-300 cursor-pointer overflow-hidden`}
      style={{
        transform: isHovered ? 'translateX(4px) scale(1.01)' : 'translateX(0) scale(1)',
        boxShadow: isHovered ? '0 8px 30px rgba(0,0,0,0.3)' : 'none'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div 
            className={`w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0 transition-all duration-300`}
            style={{
              transform: isHovered ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
              backgroundColor: isHovered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)'
            }}
          >
            <FileTextIcon className={`h-6 w-6 transition-colors duration-300 ${isHovered ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-white text-sm font-medium truncate transition-colors duration-300 ${isHovered ? 'text-emerald-400' : ''}`}>
              {teklif.urun_adi}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{teklif.firma_adi}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>{teklif.kategori || 'Genel'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>{new Date(teklif.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-emerald-400 font-bold text-sm">
            {formatPrice(teklif.fiyat, teklif.para_birimi)}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full border ${durumColors[teklif.durum] || durumColors.pending} transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
            {durumLabels[teklif.durum] || '⏳ Beklemede'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ANA SAYFA
// ============================================================

export default function PanelPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    toplamFiyat: 0,
    aktifFiyat: 0,
    toplamFirma: 0,
    toplamKategori: 0
  })
  const [sonFiyatlar, setSonFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [tarih, setTarih] = useState('')
  const [saat, setSaat] = useState('')
  const [isDark, setIsDark] = useState(true)
  const [notifications, setNotifications] = useState(3)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMenu, setFilteredMenu] = useState([])
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [greeting, setGreeting] = useState('')

  const menuItems = useMemo(() => [
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', count: '+', color: 'emerald' },
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', count: stats.toplamFiyat, color: 'blue' },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', count: stats.toplamFiyat, color: 'cyan' },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', count: stats.toplamKategori, color: 'purple' },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', count: stats.toplamFirma, color: 'amber' },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', count: '0', color: 'rose' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', count: '0', color: 'indigo' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', count: '0', color: 'slate' }
  ], [stats])

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      
      setTarih(`${now.getDate()} ${aylar[now.getMonth()]} ${now.getFullYear()} ${gunler[now.getDay()]}`)
      setSaat(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      
      const hour = now.getHours()
      if (hour < 12) setGreeting('🌅 Günaydın')
      else if (hour < 18) setGreeting('☀️ İyi Günler')
      else setGreeting('🌙 İyi Akşamlar')
    }

    const fetchStats = async () => {
      try {
        const { count: fiyatCount } = await supabase
          .from('fiyat_teklifleri')
          .select('*', { count: 'exact', head: true })

        const { count: aktifCount } = await supabase
          .from('fiyat_teklifleri')
          .select('*', { count: 'exact', head: true })
          .eq('durum', 'approved')

        const { count: firmaCount } = await supabase
          .from('firmalar')
          .select('*', { count: 'exact', head: true })

        const { count: kategoriCount } = await supabase
          .from('kategoriler')
          .select('*', { count: 'exact', head: true })

        const { data: sonFiyatlar } = await supabase
          .from('fiyat_teklifleri')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          toplamFiyat: fiyatCount || 0,
          aktifFiyat: aktifCount || 0,
          toplamFirma: firmaCount || 0,
          toplamKategori: kategoriCount || 0
        })
        setSonFiyatlar(sonFiyatlar || [])
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredMenu(
        menuItems.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredMenu(menuItems)
    }
  }, [searchTerm, menuItems])

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Arka Plan Efektleri */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-1500" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl animate-pulse delay-2500" />
      </div>

      {/* Ana İçerik */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* HEADER - ULTRA PRO MAX */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/40 animate-pulse">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
                  TermoEnerji
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-300 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    Ultra Pro Max Yönetim Paneli
                  </span>
                  <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    v.8.0
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <Bell className="h-4 w-4" />
                <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Sistem Aktif</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* KARŞILAMA BÖLÜMÜ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {greeting}!
              <span className="text-sm font-normal text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                {stats.aktifFiyat} teklif aktif
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">Fiyat tekliflerinizi yönetmek için hazırsınız.</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {tarih}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {saat}
              </span>
            </div>
          </div>
        </div>

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Toplam Teklif"
            value={stats.toplamFiyat}
            icon={FileTextIcon}
            color="emerald"
            change={12}
            loading={loading}
          />
          <StatCard
            title="Aktif Teklif"
            value={stats.aktifFiyat}
            icon={CheckCircle}
            color="blue"
            change={8}
            loading={loading}
          />
          <StatCard
            title="Firmalar"
            value={stats.toplamFirma}
            icon={Building2}
            color="amber"
            subtitle={`${stats.toplamFirma > 0 ? stats.toplamFirma : 0} kayıtlı`}
            loading={loading}
          />
          <StatCard
            title="Kategoriler"
            value={stats.toplamKategori}
            icon={Layers}
            color="purple"
            subtitle={`${stats.toplamKategori > 0 ? stats.toplamKategori : 0} kategori`}
            loading={loading}
          />
        </div>

        {/* FİRMALAR VE KATEGORİLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Firmalar
              </h3>
              <span className="text-xs text-slate-400">{stats.toplamFirma} kayıt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Kıymetli ürün ödül', 'FIRMA', 'DİGİPİM', 'DİNİC MİSKANİK', 'TERMOENERJİ', 'TEKNİK SERVİS'].map((firma, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 cursor-pointer">
                  {firma}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                Kategoriler
              </h3>
              <span className="text-xs text-slate-400">{stats.toplamKategori} kayıt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['SCH40 BORU', 'KELEBEK VANA', 'TERMOSTAT', 'POMPA', 'KOMPRESÖR', 'FAN', 'RADYATÖR', 'KAZAN'].map((kat, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 cursor-pointer">
                  {kat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MENÜ VE SON FİYATLAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Menu className="h-5 w-5 text-blue-400" />
              Menü
            </h3>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  href={item.href}
                  count={item.count}
                  color={item.color}
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileTextIcon className="h-5 w-5 text-blue-400" />
                Fiyat Teklifleri
              </h3>
              <span className="text-xs text-slate-400">Son 5 teklif</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sonFiyatlar.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Henüz teklif eklenmemiş</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sonFiyatlar.map((teklif) => (
                  <TeklifCard
                    key={teklif.id}
                    teklif={teklif}
                    onClick={() => router.push('/panel/fiyat-listesi')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-slate-500 text-xs py-4 border-t border-slate-700/50">
          <p>© 2024 TermoEnerji Yönetim Paneli</p>
          <p className="mt-1">Fiyat Teklif Yönetim Sistemi v.8.0</p>
        </div>
      </div>
    </div>
  )
}
