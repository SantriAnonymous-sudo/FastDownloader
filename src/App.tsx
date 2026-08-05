import React, { useState, useEffect } from 'react';
import { 
  Download, History, Cpu, HelpCircle, Film, Play, Trash2, Copy, ExternalLink, 
  CheckCircle, RefreshCw, Star, Info, Volume2, Shield, AlertCircle, Share2, Music
} from 'lucide-react';
import AndroidFrame from './components/AndroidFrame';
import MainDownloader from './components/MainDownloader';
import { DownloadItem, AiAnalysisResult } from './types';

export default function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'downloader' | 'history' | 'ai' | 'about'>('downloader');
  
  // Download history state persisted with localStorage
  const [historyList, setHistoryList] = useState<DownloadItem[]>([]);
  
  // Interactive global URL state
  const [selectedUrl, setSelectedUrl] = useState('');
  
  // Current item being analyzed by AI or displayed in player
  const [aiAnalysisTarget, setAiAnalysisTarget] = useState<{ url: string; title: string; platform: string } | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Audio playback simulator state
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<DownloadItem | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(0);

  // Video playback simulator modal
  const [activeVideoPlaying, setActiveVideoPlaying] = useState<DownloadItem | null>(null);

  // Success indicator notice state
  const [toastMessage, setToastMessage] = useState('');

  // beforeinstallprompt state for native Android installation
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const triggerAndroidInstall = async () => {
    if (!deferredPrompt) {
      showToast('Tekan tombol menu browser lalu pilih "Tambahkan ke Layar Utama"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Terima kasih telah menginstal AnDownloader Pro!');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // Initial load of download history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('andownloader_history');
      if (stored) {
        setHistoryList(JSON.parse(stored));
      } else {
        // Hydrate with cool default local entries for user guidance if history empty
        const sampleHistory: DownloadItem[] = [
          {
            id: 'demo-yt-1',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            platform: 'youtube',
            title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
            thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=320&auto=format&fit=crop',
            duration: '03:32',
            format: 'video',
            downloadUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-keys-with-keychain-hanging-from-car-ignition-keyhole-51921-large.mp4',
            timestamp: Date.now() - 3600000 * 2
          },
          {
            id: 'demo-tk-2',
            url: 'https://www.tiktok.com/@creator/video/12345',
            platform: 'tiktok',
            title: 'Resep Masakan Viral Enak & Simple Untuk Sahur',
            thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=320&auto=format&fit=crop',
            duration: '01:05',
            format: 'audio',
            downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            timestamp: Date.now() - 3600000 * 24
          }
        ];
        setHistoryList(sampleHistory);
        localStorage.setItem('andownloader_history', JSON.stringify(sampleHistory));
      }
    } catch (e) {
      console.error('LocalStorage load failed', e);
    }
  }, []);

  // Update localStorage helper
  const saveHistoryToStorage = (updated: DownloadItem[]) => {
    setHistoryList(updated);
    try {
      localStorage.setItem('andownloader_history', JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage save failed', e);
    }
  };

  const handleAddHistory = (item: DownloadItem) => {
    const updated = [item, ...historyList];
    saveHistoryToStorage(updated);
    showToast('Media berhasil ditambahkan ke Riwayat!');
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter(item => item.id !== id);
    saveHistoryToStorage(updated);
    showToast('Item berhasil dihapus');
    if (activeAudioPlaying?.id === id) {
      setIsAudioPlaying(false);
      setActiveAudioPlaying(null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat unduhan?')) {
      saveHistoryToStorage([]);
      setIsAudioPlaying(false);
      setActiveAudioPlaying(null);
      showToast('Seluruh riwayat berhasil dikosongkan!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Run dynamic Gemini AI content metadata analysis
  const runAiAnalysis = async (target: { url: string; title: string; platform: string }) => {
    setIsAiLoading(true);
    setAiAnalysisResult(null);
    try {
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(target),
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysisResult(data);
      } else {
        showToast('Analisis gagal, memuat deskripsi standard.');
      }
    } catch (err) {
      showToast('Gagal memproses AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (aiAnalysisTarget) {
      runAiAnalysis(aiAnalysisTarget);
    }
  }, [aiAnalysisTarget]);

  // Handle setting a generic analysis request based on search input
  const handleCustomAiTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUrl) {
      showToast('Masukkan link video terlebih dahulu!');
      return;
    }
    let platform = "youtube";
    if (/tiktok/i.test(selectedUrl)) platform = "tiktok";
    if (/instagram/i.test(selectedUrl)) platform = "instagram";

    const target = {
      url: selectedUrl,
      title: "Optimasi Konten Unduhan",
      platform: platform
    };
    setAiAnalysisTarget(target);
  };

  // Simulated live audio progress loops
  useEffect(() => {
    let timer: any;
    if (isAudioPlaying && activeAudioPlaying) {
      timer = setInterval(() => {
        setAudioPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isAudioPlaying, activeAudioPlaying]);

  const handlePlayAudio = (item: DownloadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeAudioPlaying?.id === item.id) {
      setIsAudioPlaying(!isAudioPlaying);
    } else {
      setActiveAudioPlaying(item);
      setIsAudioPlaying(true);
      setAudioPlaybackProgress(0);
    }
  };

  const handleShareDetails = (item: DownloadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(`Tonton media: ${item.title}\nLink: ${item.url}`);
      showToast('Detail disalin! Siap untuk dibagikan.');
    } catch (err) {
      showToast('Format salin tidak didukung.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      showToast(`${label} berhasil disalin!`);
    } catch (e) {
      showToast('Gagal menyalin teks');
    }
  };

  const appReset = () => {
    setSelectedUrl('');
    setAiAnalysisTarget(null);
    setAiAnalysisResult(null);
    setActiveTab('downloader');
    showToast('Aplikasi di-reset ulang!');
  };

  return (
    <AndroidFrame 
      isFullscreen={isFullscreen} 
      setIsFullscreen={setIsFullscreen} 
      onRefresh={appReset}
    >
      {/* Toast HUD */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-indigo-600 border border-indigo-400 text-white font-medium text-xs py-2.5 px-5 rounded-full z-50 shadow-2xl transition duration-300 animate-bounce flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Views Display Area */}
      <div className="flex-1 flex flex-col pb-20">
        
        {/* VIEW 1: Main Downloader Screen */}
        {activeTab === 'downloader' && (
          <MainDownloader 
            onAddHistory={handleAddHistory}
            selectedUrl={selectedUrl}
            setSelectedUrl={setSelectedUrl}
            onSelectAnalyze={setAiAnalysisTarget}
            activeTab={activeTab}
            setActiveTab={(tab: any) => setActiveTab(tab)}
          />
        )}

        {/* VIEW 2: Downloaded History Screen */}
        {activeTab === 'history' && (
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">Riwayat Unduhan</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Media yang telah berhasil Anda unduh di sesi ini.</p>
              </div>
              {historyList.length > 0 && (
                <button
                  id="btn-clear-history"
                  onClick={handleClearAllHistory}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}
            </div>

            {/* List of items */}
            {historyList.length === 0 ? (
              <div className="flex-1 my-12 flex flex-col items-center justify-center p-6 text-center bg-[#13141c] border border-gray-850 rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-900/40 mb-3">
                  <History className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-gray-200">Riwayat Anda Kosong</h4>
                <p className="text-[10px] text-gray-500 max-w-xs mt-1.5 font-medium leading-relaxed">
                  Belum ada video atau musik yang diunduh. Silakan tempel link video, lalu ketuk tombol "Parse video" untuk memulai.
                </p>
                <button
                  id="btn-history-goto-downloader"
                  onClick={() => setActiveTab('downloader')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md"
                >
                  Mulai Unduh Sekarang
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {historyList.map((item) => (
                  <div 
                    key={item.id}
                    id={`history-item-${item.id}`}
                    className="bg-[#12141c] border border-gray-850 rounded-2xl p-3 flex flex-col gap-3 hover:border-indigo-500/25 transition duration-300"
                  >
                    <div className="flex gap-2.5">
                      {/* Left Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shrink-0 relative">
                        <img 
                          src={item.thumbnail} 
                          alt="media thumb" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          {item.format === 'video' ? (
                            <button
                              id={`play-vid-th-${item.id}`}
                              onClick={() => {
                                setActiveVideoPlaying(item);
                                showToast(`Menonton: ${item.title}`);
                              }}
                              className="w-7 h-7 bg-white/90 hover:bg-white text-[#111] rounded-full flex items-center justify-center shadow-lg active:scale-90 transition cursor-pointer"
                              title="Tonton Preview"
                            >
                              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                            </button>
                          ) : (
                            <button 
                              id={`play-aud-th-${item.id}`}
                              onClick={(e) => handlePlayAudio(item, e)}
                              className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition cursor-pointer"
                              title="Putar Audio"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Info Title and type */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                              item.format === 'audio' 
                                ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/30' 
                                : 'bg-pink-950 text-pink-400 border border-pink-900/30'
                            }`}>
                              {item.format === 'audio' ? 'AUDIO MP3' : 'VIDEO MP4'}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-100 line-clamp-1 mt-1">
                            {item.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="capitalize font-semibold text-gray-300">{item.platform}</span>
                          <span>Durasi: {item.duration || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Integrated audio progress wave for current active music */}
                    {activeAudioPlaying?.id === item.id && (
                      <div className="bg-[#0b0c11] p-2.5 rounded-xl border border-indigo-950 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-indigo-400 font-mono flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5 animate-bounce" />
                            {isAudioPlaying ? 'Sedang Memutar...' : 'Audio Dipause'}
                          </span>
                          <span className="font-mono text-gray-500">{Math.round(audioPlaybackProgress)}%</span>
                        </div>
                        
                        {/* Interactive dynamic sound wave simulation visualizer */}
                        <div className="h-6 flex items-end justify-center gap-1 my-1">
                          {[...Array(14)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1 bg-indigo-500 rounded-full transition-all duration-300 ${isAudioPlaying ? 'wave-bar' : ''}`}
                              style={{ 
                                height: isAudioPlaying ? `${20 + Math.random() * 80}%` : '20%',
                                animationDelay: `${i * 0.08}s`
                              }}
                            ></div>
                          ))}
                        </div>

                        {/* Player slider control bar */}
                        <div className="relative w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${audioPlaybackProgress}%` }}
                          ></div>
                        </div>

                        {/* Player buttons */}
                        <div className="flex items-center justify-center gap-4 mt-1">
                          <button
                            id="btn-toggle-play-simulator"
                            onClick={(e) => handlePlayAudio(item, e)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            {isAudioPlaying ? 'Pause Lagu' : 'Putar Lagu'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Panel */}
                    <div className="flex items-center justify-between border-t border-gray-850/60 pt-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-share-${item.id}`}
                          onClick={(e) => handleShareDetails(item, e)}
                          className="text-gray-400 hover:text-white flex items-center gap-1 py-1 px-2 rounded-md hover:bg-gray-800/40 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Medsos</span>
                        </button>
                        <button
                          id={`btn-re-download-${item.id}`}
                          onClick={() => {
                            setSelectedUrl(item.url);
                            setActiveTab('downloader');
                            showToast('Video terpilih kembali!');
                          }}
                          className="text-indigo-400 hover:text-white flex items-center gap-1 py-1 px-2 rounded-md hover:bg-gray-800/40 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Unduh Lagi</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Open Direct Browser fallback link info button */}
                        <a 
                          href={item.downloadUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 px-2 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 rounded bg-emerald-950/10 border border-emerald-900/20"
                          title="Buka link unduhan di tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Link Direct</span>
                        </a>

                        <button
                          id={`btn-delete-${item.id}`}
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Gemini AI content Optimizer Screen */}
        {activeTab === 'ai' && (
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Optimasi Konten AI</span>
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Generasi judul viral, hashtag, dan deskripsi re-upload via Gemini 3.5 Flash.</p>
            </div>

            {/* Input target url card */}
            <div className="bg-[#12131b] border border-gray-850 rounded-2xl p-3.5">
              <form onSubmit={handleCustomAiTarget} className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tautan Analisis Aktif</label>
                <div className="relative">
                  <input
                    type="url"
                    id="input-ai-url"
                    value={selectedUrl}
                    onChange={(e) => setSelectedUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-3 pr-24 py-2.5 bg-[#0a0b0e] border border-gray-800 text-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500/80"
                  />
                  <button
                    type="submit"
                    id="btn-ai-submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    PROSES AI
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 leading-snug">
                  *AI akan menganalisis platform, mengekstrak kata kunci, dan menyarankan optimasi postingan agar viral di media sosial Anda.
                </p>
              </form>
            </div>

            {/* AI Result Card */}
            {isAiLoading ? (
              <div className="bg-[#13151f] border border-indigo-950/40 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500/10 border-t-indigo-400 animate-spin"></div>
                  <Cpu className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Menganalisis Konten...</h4>
                  <p className="text-[10px] text-gray-500 mt-1 max-w-xs">
                    Gemini AI sedang menulis ulang judul viral, menganalisis trend hashtags sosmed, dan menyusun deskripsi video.
                  </p>
                </div>
              </div>
            ) : aiAnalysisResult ? (
              <div className="flex flex-col gap-4">
                
                {/* 1. Viral Headings */}
                <div className="bg-[#13141d] border border-gray-850 rounded-2xl p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Alternatif Judul (Viral Copy)</span>
                    <span className="text-[9px] text-gray-500">Ketuk untuk salin</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div 
                      onClick={() => copyToClipboard(aiAnalysisResult.titles.viral, 'Judul Viral')}
                      className="p-2.5 bg-[#090a0e] hover:bg-indigo-950/20 rounded-xl border border-gray-900 cursor-pointer transition flex items-start gap-2 group"
                    >
                      <span className="text-[9px] bg-red-950 text-red-400 p-1 rounded font-bold leading-none select-none">HOT</span>
                      <span className="text-xs text-gray-200 font-semibold line-clamp-2 leading-relaxed flex-1 group-hover:text-white">
                        {aiAnalysisResult.titles.viral}
                      </span>
                    </div>

                    <div 
                      onClick={() => copyToClipboard(aiAnalysisResult.titles.descriptive, 'Judul SEO')}
                      className="p-2.5 bg-[#090a0e] hover:bg-indigo-950/20 rounded-xl border border-gray-900 cursor-pointer transition flex items-start gap-2 group"
                    >
                      <span className="text-[9px] bg-indigo-950 text-indigo-400 p-1 rounded font-bold leading-none select-none">SEO</span>
                      <span className="text-xs text-gray-200 font-semibold line-clamp-2 leading-relaxed flex-1 group-hover:text-white">
                        {aiAnalysisResult.titles.descriptive}
                      </span>
                    </div>

                    <div 
                      onClick={() => copyToClipboard(aiAnalysisResult.titles.clean, 'Judul Clean')}
                      className="p-2.5 bg-[#090a0e] hover:bg-indigo-950/20 rounded-xl border border-gray-900 cursor-pointer transition flex items-start gap-2 group"
                    >
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 p-1 rounded font-bold leading-none select-none">MIN</span>
                      <span className="text-xs text-gray-200 font-semibold line-clamp-2 leading-relaxed flex-1 group-hover:text-white">
                        {aiAnalysisResult.titles.clean}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Captivating Meta Description */}
                <div className="bg-[#13141d] border border-gray-850 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Deskripsi Re-upload</span>
                    <button 
                      onClick={() => copyToClipboard(aiAnalysisResult.description, 'Deskripsi')}
                      className="text-[9px] text-gray-400 hover:text-white bg-gray-900 p-1 px-2 rounded-md border border-gray-800 transition"
                    >
                      Salin Deskripsi
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-300 font-medium">
                    {aiAnalysisResult.description}
                  </p>
                </div>

                {/* 3. Hashtags block */}
                <div className="bg-[#13141d] border border-gray-850 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Trending Hashtags ({aiAnalysisResult.category})</span>
                    <button 
                      onClick={() => copyToClipboard(aiAnalysisResult.hashtags.join(' '), 'Semua Hashtag')}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300"
                    >
                      Salin Semua
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysisResult.hashtags.map((tag, idx) => (
                      <span 
                        key={idx}
                        onClick={() => copyToClipboard(tag, 'Hashtag')}
                        className="text-[10px] px-2 py-1 bg-[#090a0f] text-gray-300 border border-gray-900 rounded-lg cursor-pointer hover:border-indigo-500/25 transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Categorization Keywords Tags */}
                <div className="bg-[#13141d] border border-gray-850 rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tags Meta Optimasi</span>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysisResult.tags.map((kw, i) => (
                      <span key={i} className="text-[9px] bg-gray-950 text-gray-400 py-0.5 px-2 rounded border border-gray-900">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="my-8 flex flex-col items-center justify-center p-6 text-center bg-[#13141c] border border-gray-850 rounded-3xl">
                <div className="w-12 h-12 bg-indigo-950/40 text-indigo-400 rounded-2xl flex items-center justify-center mb-3">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-gray-200">Menunggu Input Tautan</h4>
                <p className="text-[10px] text-gray-500 max-w-xs mt-1 leading-relaxed">
                  Gunakan fitur ini setelah mengunduh media. Anda dapat menekan tombol "Optimasi AI" di panel utama hasil download atau memasukkan URL manual di atas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: About & Features Screen */}
        {activeTab === 'about' && (
          <div className="flex-1 p-5 flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-extrabold text-white">Panduan & Informasi</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Platform Video & Audio Downloader multi-jejaring sosial.</p>
            </div>

            {/* Android PWA Install Widget */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-blue-950/20 border border-indigo-500/30 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-xl">
              <div className="absolute right-[-10px] top-[-10px] opacity-10">
                <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 15.3l1.815 3.144a.9.9 0 011.558-.9L19.07 14.39a9.94 9.94 0 001.917-3.951h1.564a.9.9 0 000-1.8H20.98a9.941 9.941 0 00-1.92-3.956l1.821-3.155a.9.9 0 10-1.558-.9l-1.808 3.13A9.907 9.907 0 0012 3c-2.072 0-3.992.634-5.584 1.713L4.61 1.587a.9.9 0 10-1.558.9l1.82 3.153A9.944 9.944 0 002.94 9.59H1.381a.9.9 0 000 1.8h1.566c.159 1.455.83 2.784 1.905 3.94l-1.815 3.144a.9.9 0 001.558.9l1.815-3.144c1.173.844 2.502 1.42 3.94 1.636V22.2a.9.9 0 001.8 0v-4.321a9.932 9.932 0 006.183-.58zM7.5 9a1 1 0 110-2 1 1 0 010 2zm9 0a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/40 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-350">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3l1.815 3.144a.9.9 0 011.558-.9L19.07 14.39a9.94 9.94 0 001.917-3.951h1.564a.9.9 0 000-1.8H20.98a9.941 9.941 0 00-1.92-3.956l1.821-3.155a.9.9 0 10-1.558-.9l-1.808 3.13A9.907 9.907 0 0012 3c-2.072 0-3.992.634-5.584 1.713L4.61 1.587a.9.9 0 10-1.558.9l1.82 3.153A9.944 9.944 0 002.94 9.59H1.381a.9.9 0 000 1.8h1.566c.159 1.455.83 2.784 1.905 3.94l-1.815 3.144a.9.9 0 001.558.9l1.815-3.144c1.173.844 2.502 1.42 3.94 1.636V22.2a.9.9 0 001.8 0v-4.321a9.932 9.932 0 006.183-.58zM7.5 9a1 1 0 110-2 1 1 0 010 2zm9 0a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-150">Instal Aplikasi Android</h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    AnDownloader Pro mendukung instalasi PWA di Android HP Anda tanpa lewat Play Store. Aplikasi berjalan lebih ringan, lancar, dan cepat!
                  </p>
                </div>
              </div>

              {showInstallBtn ? (
                <button
                  type="button"
                  id="btn-trigger-pwa-install"
                  onClick={triggerAndroidInstall}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-98 transition shadow-lg cursor-pointer"
                >
                  INSTAL APLIKASI SEKARANG
                </button>
              ) : (
                <div className="bg-[#0e0f17]/80 rounded-xl p-2.5 border border-indigo-950/40 text-[10px] text-indigo-400 flex flex-col gap-1">
                  <span className="font-bold flex items-center gap-1 text-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Panduan Instalasi Manual Chrome (Android):
                  </span>
                  <p className="text-gray-400 leading-normal pl-2.5 text-[9px]">
                    1. Ketuk icon <strong className="text-gray-200">titik tiga</strong> di pojok kanan atas browser Google Chrome.<br />
                    2. Pilih menu <strong className="text-gray-200">"Tambahkan ke Layar Utama" (Add to Home screen)</strong> atau <strong className="text-gray-200">"Instal Aplikasi"</strong>.<br />
                    3. Konfirmasi instalasi, pintasan aplikasi akan muncul langsung di layar utama smartphone Android Anda!
                  </p>
                </div>
              )}
            </div>

            {/* List of platforms */}
            <div className="bg-[#12131c] border border-gray-850 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Situs & Format Yang Didukung</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-[#090a0f] border border-gray-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-200 font-bold">YouTube (MP4/MP3)</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090a0f] border border-gray-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  <span className="text-xs text-gray-200 font-bold">TikTok Video (HD)</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090a0f] border border-gray-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                  <span className="text-xs text-gray-200 font-bold">Instagram Reels</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090a0f] border border-gray-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                  <span className="text-xs text-gray-200 font-bold">Twitter / X Media</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090a0f] border border-gray-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-200 font-bold">Facebook Video</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090a0f] border border-gray-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-200 font-bold">Lainnya (Link Web)</span>
                </div>
              </div>
            </div>

            {/* Application specs and terms */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#12131c] border border-gray-850 p-4 rounded-2xl text-xs flex flex-col gap-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  Keamanan & Privasi
                </span>
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  Aplikasi ini mengkhususkan diri untuk mengunduh konten dari domain publik atau media milik pengguna itu sendiri. Harap hormati hak cipta para kreator dan jangan gunakan media yang diunduh untuk urusan melanggar hak milik komersial.
                </p>
              </div>

              <div className="bg-[#12131c] border border-gray-850 p-4 rounded-2xl text-xs flex flex-col gap-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Spesifikasi Aplikasi
                </span>
                <div className="flex flex-col gap-2 font-mono text-[10px] text-gray-400">
                  <div className="flex justify-between border-b border-gray-900 pb-1">
                    <span>Versi OS Target</span>
                    <span className="text-gray-300">Android 14 (API 34)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 pb-1">
                    <span>Dukungan Audio</span>
                    <span className="text-gray-300 font-bold text-indigo-400">MP3 / AAC (320kbps)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 pb-1">
                    <span>Dukungan Video</span>
                    <span className="text-gray-300">MP4 (H.264 / HD 1080p)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sistem Ekstraksi</span>
                    <span className="text-emerald-400 font-bold">Cobalt Tools API + Proxy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-600 font-medium py-3 flex flex-col items-center justify-center gap-1.5 border-t border-gray-900/60 mt-4">
              <span>Copyright © 2026 AnDownloader Pro App. All rights reserved.</span>
              <span className="text-xs text-indigo-400 font-mono font-bold tracking-wider bg-indigo-950/40 border border-indigo-900/30 px-3 py-0.5 rounded-full">
                created by : mgz.ai_
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Video Preview Simulator Modal overlay */}
      {activeVideoPlaying && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col justify-between p-4 animate-fade-in">
          {/* Modal Header Controls */}
          <div className="flex justify-between items-center bg-[#111] p-3 rounded-2xl border border-gray-800">
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-[9px] text-indigo-400 font-bold uppercase">Video Player Simulator</span>
              <h3 className="text-xs font-bold text-gray-100 line-clamp-1">{activeVideoPlaying.title}</h3>
            </div>
            <button
              id="btn-close-video-player"
              onClick={() => setActiveVideoPlaying(null)}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
            >
              Tutup
            </button>
          </div>

          {/* Actual simulated Video streaming box */}
          <div className="flex-1 flex items-center justify-center p-2">
            <div className="w-full aspect-[16/9] bg-[#0d0e12] border border-gray-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col justify-between">
              
              <video 
                src={activeVideoPlaying.downloadUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={activeVideoPlaying.thumbnail}
              />
              
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-emerald-400 font-mono text-[9px] rounded-md border border-emerald-500/20">
                ● Streaming Server Aktif
              </div>
            </div>
          </div>

          {/* Modal footer information details */}
          <div className="bg-[#111219] p-3.5 rounded-2xl border border-gray-850 flex flex-col gap-1 text-[11px] text-gray-400">
            <p className="font-bold text-gray-300">Deskripsi Platform</p>
            <p className="line-clamp-2 leading-relaxed text-[10px]">
              Konten diunduh langsung dari tautan "{activeVideoPlaying.url}". Player ini berfungsi menguji keabsahan berkas video sebelum dipindahkan ke pemutar sistem Android galeri HP Anda.
            </p>
          </div>
        </div>
      )}

      {/* Android Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#0a0b0e] border-t border-gray-900 px-6 flex items-center justify-between z-40 select-none">
        
        {/* Tab 1: Downloader */}
        <button
          type="button"
          id="nav-downloader"
          onClick={() => setActiveTab('downloader')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'downloader' ? 'text-indigo-400 scale-105 font-bold' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Downloader</span>
        </button>

        {/* Tab 2: History */}
        <button
          type="button"
          id="nav-history"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all relative ${
            activeTab === 'history' ? 'text-indigo-400 scale-105 font-bold' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Riwayat</span>
          {historyList.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-indigo-600 text-white font-mono text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0a0b0e]">
              {historyList.length}
            </span>
          )}
        </button>

        {/* Tab 3: AI Insights */}
        <button
          type="button"
          id="nav-ai"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'ai' ? 'text-indigo-400 scale-105 font-bold' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Optimasi AI</span>
        </button>

        {/* Tab 4: Guidelines */}
        <button
          type="button"
          id="nav-about"
          onClick={() => setActiveTab('about')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'about' ? 'text-indigo-400 scale-105 font-bold' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Panduan</span>
        </button>

      </div>
    </AndroidFrame>
  );
}
