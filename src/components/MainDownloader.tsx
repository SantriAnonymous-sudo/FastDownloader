import React, { useState, useEffect } from 'react';
import { 
  Download, Link2, Music, Video, Star, Globe, CheckCircle, 
  Trash2, Copy, AlertTriangle, Play, HelpCircle, FileText, Cpu, Layout, List
} from 'lucide-react';
import { DownloadItem } from '../types';

interface MainDownloaderProps {
  onAddHistory: (item: DownloadItem) => void;
  selectedUrl: string;
  setSelectedUrl: (url: string) => void;
  onSelectAnalyze: (item: { url: string; title: string; platform: string }) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SAMPLE_LINKS = [
  { name: 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platform: 'youtube' },
  { name: 'TikTok Reel', url: 'https://www.tiktok.com/@tiktok/video/7123456789123456789', platform: 'tiktok' },
  { name: 'Instagram Reel', url: 'https://www.instagram.com/reels/C8abCdEfGhI/', platform: 'instagram' },
  { name: 'Twitter Video', url: 'https://x.com/jack/status/20', platform: 'twitter' },
];

export default function MainDownloader({ 
  onAddHistory, 
  selectedUrl, 
  setSelectedUrl, 
  onSelectAnalyze, 
  activeTab, 
  setActiveTab 
}: MainDownloaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'video' | 'audio'>('video');
  const [selectedResolution, setSelectedResolution] = useState<string>('720');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<any>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string>('generic');
  
  // Custom download state tracking
  const [downloadStep, setDownloadStep] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 MB/s');

  useEffect(() => {
    if (selectedUrl) {
      setUrlInput(selectedUrl);
      detectPlatformFromUrl(selectedUrl);
    }
  }, [selectedUrl]);

  const detectPlatformFromUrl = (url: string) => {
    if (/youtube\.com|youtu\.be/i.test(url)) {
      setDetectedPlatform('youtube');
    } else if (/tiktok\.com/i.test(url)) {
      setDetectedPlatform('tiktok');
    } else if (/instagram\.com/i.test(url)) {
      setDetectedPlatform('instagram');
    } else if (/twitter\.com|x\.com/i.test(url)) {
      setDetectedPlatform('twitter');
    } else if (/facebook\.com/i.test(url)) {
      setDetectedPlatform('facebook');
    } else {
      setDetectedPlatform('generic');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setSelectedUrl(val);
    detectPlatformFromUrl(val);
    setErrorMessage('');
    setSuccessInfo(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        setSelectedUrl(text);
        detectPlatformFromUrl(text);
        setErrorMessage('');
        setSuccessInfo(null);
      }
    } catch (e) {
      // clipboard permission fallback
      setErrorMessage("Silakan paste manual tautan Anda pada kolom input.");
    }
  };

  const triggerExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    const targetUrl = urlInput.trim();
    if (!targetUrl) {
      setErrorMessage('Harap isi atau paste link video terlebih dahulu!');
      return;
    }

    setIsExtracting(true);
    setDownloadStep('Menganalisis link tautan...');
    setDownloadProgress(10);

    const stepIntervals = [
      { prg: 30, text: 'Membaca metadata video dari platform...' },
      { prg: 65, text: 'Mengekstrak format audio/video di server...' },
      { prg: 90, text: 'Menyiapkan tautan proxy unduhan premium...' },
    ];

    let currentStepIndex = 0;
    const progressTimer = setInterval(() => {
      if (currentStepIndex < stepIntervals.length) {
        setDownloadProgress(stepIntervals[currentStepIndex].prg);
        setDownloadStep(stepIntervals[currentStepIndex].text);
        currentStepIndex++;
      }
    }, 450);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          format: selectedFormat,
          resolution: selectedResolution
        }),
      });

      clearInterval(progressTimer);
      setDownloadProgress(100);

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessInfo(data);
      } else {
        setErrorMessage(data.error || 'Gagal mengekstrak berkas dari link ini. Tautan tidak didukung atau sedang dilindungi.');
      }
    } catch (error) {
      clearInterval(progressTimer);
      setErrorMessage('Terjadi kesalahan jaringan. Silakan coba sesaat lagi.');
    } finally {
      setIsExtracting(false);
      setDownloadProgress(0);
      setDownloadStep('');
    }
  };

  const loadSample = (url: string) => {
    setUrlInput(url);
    setSelectedUrl(url);
    detectPlatformFromUrl(url);
    setErrorMessage('');
    setSuccessInfo(null);
  };

  // Triggers final actual file saving sequence
  const startFileDownload = () => {
    if (!successInfo) return;

    setIsDownloading(true);
    setDownloadProgress(5);
    setDownloadStep('Memulai pengunduhan...');
    
    // Simulate active downloading stream on screen
    let speed = 4 + Math.random() * 6;
    setDownloadSpeed(`${speed.toFixed(1)} MB/s`);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          finishDownload();
          return 100;
        }
        
        // Random speed drops/gains
        const speedFloat = 3 + Math.random() * 8;
        setDownloadSpeed(`${speedFloat.toFixed(1)} MB/s`);
        
        let increment = 10;
        if (prev > 45) increment = 7;
        if (prev > 75) increment = 4;
        return prev + increment;
      });
      
      const steps = [
        'Mengunduh blok data dari media...',
        'Memotong filter suara...',
        'Sinkronisasi trek audio & video...',
        'Menyusun berkas final...',
      ];
      const randomStep = steps[Math.floor(Math.random() * steps.length)];
      setDownloadStep(randomStep);
    }, 280);
  };

  const finishDownload = () => {
    setIsDownloading(false);
    setDownloadProgress(0);
    setDownloadStep('');
    
    // Create new saved history item
    const newItem: DownloadItem = {
      id: Math.random().toString(36).substring(2, 9),
      url: urlInput,
      platform: detectedPlatform,
      title: successInfo.title,
      thumbnail: successInfo.thumbnail,
      duration: successInfo.duration || '02:30',
      format: successInfo.format,
      downloadUrl: successInfo.downloadUrl,
      timestamp: Date.now()
    };
    
    onAddHistory(newItem);

    // Dynamic actual save trigger in client browser environment
    // For cross-origin URLs on Android Chrome, we proxy them through our attachment headers so they are saved to device storage
    let finalSaveUrl = successInfo.downloadUrl;
    if (finalSaveUrl.startsWith('http') && !finalSaveUrl.includes(window.location.host)) {
      const cleanFileName = (successInfo.title || 'download').replace(/[^\w\s-]/g, '').trim().substring(0, 40) || 'download';
      finalSaveUrl = `/api/download-proxy?url=${encodeURIComponent(successInfo.downloadUrl)}&filename=${encodeURIComponent(cleanFileName)}.${successInfo.format === 'audio' ? 'mp3' : 'mp4'}`;
    }

    const link = document.createElement('a');
    link.href = finalSaveUrl;
    link.setAttribute('download', `${successInfo.title || 'download'}.${successInfo.format === 'audio' ? 'mp3' : 'mp4'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'youtube':
        return <span className="bg-red-600/20 text-red-500 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-red-500/20">YouTube</span>;
      case 'tiktok':
        return <span className="bg-white/10 text-gray-200 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-gray-500/20">TikTok HQ</span>;
      case 'instagram':
        return <span className="bg-pink-600/20 text-pink-400 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-pink-500/20">Instagram</span>;
      case 'twitter':
        return <span className="bg-indigo-600/20 text-indigo-400 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-indigo-500/20">Twitter X</span>;
      case 'facebook':
        return <span className="bg-blue-600/20 text-blue-400 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-blue-500/20">Facebook</span>;
      default:
        return <span className="bg-emerald-600/20 text-emerald-400 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-emerald-500/20">Link Web</span>;
    }
  };

  return (
    <div className="flex-1 p-5 flex flex-col gap-5">
      {/* Dynamic Header Slogan */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AnDownloader <span className="text-xs bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-md">V2.6 FULL</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Unduh video & konversi ke audio format MP3 dari seluruh media sosial instan.</p>
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/60 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium shadow-sm animate-pulse">
            created by : mgz.ai_
          </span>
        </div>
      </div>

      {/* Main Downloader Control Panel */}
      <div className="bg-[#13151e] border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
        
        {/* Format Selector: Video vs Audio */}
        <div className="bg-[#0b0c11] p-1 rounded-xl flex items-center border border-gray-900/60">
          <button
            type="button"
            id="format-video"
            onClick={() => { setSelectedFormat('video'); setSelectedResolution('720'); setSuccessInfo(null); }}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
              selectedFormat === 'video' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/35'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Format Video (MP4)</span>
          </button>
          <button
            type="button"
            id="format-audio"
            onClick={() => { setSelectedFormat('audio'); setSelectedResolution('320'); setSuccessInfo(null); }}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
              selectedFormat === 'audio' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/35'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Format AudioOnly (MP3)</span>
          </button>
        </div>

        {/* Input link form */}
        <form onSubmit={triggerExtraction} className="flex flex-col gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Link2 className="w-4 h-4" />
            </div>
            
            <input
              type="url"
              id="input-downloader-url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="Paste link video (YouTube / TikTok / IG)..."
              className="w-full pl-10 pr-20 py-3 bg-[#0a0b0f] border border-gray-800 text-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500/80 transition-all placeholder:text-gray-600"
            />
            
            <button
              type="button"
              id="btn-paste"
              onClick={handlePaste}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 text-[10px] font-bold rounded-lg border border-gray-800 active:scale-95 transition-all cursor-pointer"
            >
              PASTE
            </button>
          </div>

          {/* Resolution / Quality Selector options */}
          <div className="bg-[#0b0c11] border border-gray-900/60 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex justify-between">
              <span>Pilih Kualitas Unduhan:</span>
              <span className="text-indigo-400 font-mono">
                {selectedFormat === 'video' 
                  ? (selectedResolution === '1080' ? '1080p (Full HD)' : selectedResolution === '720' ? '720p (HD)' : selectedResolution === '480' ? '480p (SD)' : '360p (Hemat)') 
                  : (selectedResolution === '320' ? '320 kbps (HQ Audio)' : selectedResolution === '192' ? '192 kbps (MQ Audio)' : '128 kbps (LQ Audio)')
                }
              </span>
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {selectedFormat === 'video' ? (
                <>
                  {[
                    { id: '1080', name: '1080p', desc: 'Full HD' },
                    { id: '720', name: '720p', desc: 'HD Standar' },
                    { id: '480', name: '480p', desc: 'SD Medium' },
                    { id: '360', name: '360p', desc: 'Lancar' }
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      id={`quality-res-${res.id}`}
                      onClick={() => { setSelectedResolution(res.id); setSuccessInfo(null); }}
                      className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        selectedResolution === res.id
                          ? 'bg-indigo-600 border-indigo-405 text-white shadow-md shadow-indigo-600/20 font-bold'
                          : 'bg-[#10121b] border-gray-850 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                      }`}
                    >
                      <span>{res.name}</span>
                      <span className="text-[8px] opacity-70 font-normal">{res.desc}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: '320', name: '320kbps', desc: 'Master HQ' },
                    { id: '192', name: '192kbps', desc: 'Sangat Baik' },
                    { id: '128', name: '128kbps', desc: 'Hemat Data' }
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      id={`quality-audio-${res.id}`}
                      onClick={() => { setSelectedResolution(res.id); setSuccessInfo(null); }}
                      className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        selectedResolution === res.id
                          ? 'bg-indigo-600 border-indigo-405 text-white shadow-md shadow-indigo-600/20 font-bold'
                          : 'bg-[#10121b] border-gray-850 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                      }`}
                    >
                      <span>{res.name}</span>
                      <span className="text-[8px] opacity-70 font-normal">{res.desc}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            id="btn-process-download"
            disabled={isExtracting || isDownloading}
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isExtracting || isDownloading
                ? 'bg-indigo-600/40 text-indigo-300 pointer-events-none' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-98'
            }`}
          >
            {isExtracting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menguraikan Konten...
              </span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>PARSE DAN EKSTRAK TAUTAN</span>
              </>
            )}
          </button>
        </form>

        {/* Dynamic warning if wrong link */}
        {errorMessage && (
          <div className="bg-red-950/30 border border-red-900/30 p-3 rounded-xl flex gap-2 items-start text-[11px] text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Progress Monitor overlay */}
      {(isExtracting || isDownloading) && (
        <div className="bg-[#11131c] border border-indigo-900/30 rounded-2xl p-4 flex flex-col gap-2 shadow-xl animate-pulse">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span className="font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
              {downloadStep || 'Memproses berkas...'}
            </span>
            {isDownloading && (
              <span className="font-mono text-[10px] bg-indigo-950 px-2 py-0.5 rounded text-indigo-300">
                Speed: {downloadSpeed}
              </span>
            )}
          </div>
          <div className="h-2 bg-[#090a0f] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${downloadProgress || 20}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-500">
            <span>Server Proxy: Online</span>
            <span>{downloadProgress || 20}% Selesai</span>
          </div>
        </div>
      )}

      {/* Results Media Card Box */}
      {successInfo && !isDownloading && (
        <div className="bg-[#141620] border border-gray-800 rounded-3xl p-4 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
          
          {/* Subtle glowing platform backdrop color */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>

          <div className="flex gap-3">
            {/* Thumbnail Preview wrapper */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shrink-0 relative shadow-md">
              <img 
                src={successInfo.thumbnail} 
                alt="preview" 
                className="w-full h-full object-cover scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 text-[9px] text-white font-mono rounded">
                HD Selesai
              </div>
            </div>

            {/* Content particulars */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  {getPlatformIcon(successInfo.platform)}
                  {successInfo.isPremiumFallback && (
                    <span className="bg-indigo-600/15 text-indigo-300 text-[9px] font-bold py-0.5 px-2 rounded-full border border-indigo-500/20">Fallback Aktif</span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-gray-100 line-clamp-2 leading-snug mt-1">
                  {successInfo.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-2">
                <span>Ukuran: {successInfo.estimatedSize}</span>
                <span>Format: {successInfo.format === 'audio' ? 'MP3' : 'MP4'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons list */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-850">
            <button
              onClick={startFileDownload}
              id="btn-trigger-download-file"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/10 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>
                UNDUH KE HP ANDA ({selectedFormat === 'video' ? 'VIDEO MP4' : 'AUDIO MP3'})
              </span>
            </button>

            {/* AI Assistant launchpad portal shortcut */}
            <button
              onClick={() => {
                onSelectAnalyze({
                  url: urlInput,
                  title: successInfo.title,
                  platform: successInfo.platform
                });
                setActiveTab('ai');
              }}
              id="btn-analyzing-ai"
              className="w-full py-2.5 bg-[#0a0b0f] hover:bg-gray-900 border border-indigo-500/20 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition duration-300"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Optimasi Judul & Hashtag (Gunakan AI)</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick demonstration sample links */}
      <div className="mt-2">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">
          Tautan Demonstrasi Cepat
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_LINKS.map((sample, idx) => (
            <button
              id={`sample-link-${idx}`}
              key={idx}
              onClick={() => loadSample(sample.url)}
              className="p-2.5 bg-[#121319] hover:bg-gray-900 border border-gray-850 hover:border-indigo-500/25 text-left rounded-xl flex flex-col gap-0.5 cursor-pointer transition text-xs"
            >
              <span className="font-bold text-gray-200 line-clamp-1">{sample.name}</span>
              <span className="text-[9px] text-[#555] font-mono leading-none lowercase line-clamp-1">{sample.url}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Helpful instructions accordion card */}
      <div className="bg-[#12131b] border border-gray-850 rounded-2xl p-3 mt-auto">
        <h5 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bagaimana cara mengunduh?</span>
        </h5>
        <ol className="text-[10px] text-gray-400 list-decimal pl-4 flex flex-col gap-1 leading-relaxed">
          <li>Salin link video dari TikTok, Instagram, YouTube, Twitter atau platform lain.</li>
          <li>Pilih format download yang Anda inginkan (MP4 Video atau MP3 Audio).</li>
          <li>Tempel link pada kolom yang tersedia, lalu pilih tombol "Parse dan Ekstrak".</li>
          <li>Pilih tombol unduh berwarna biru untuk menyimpan file langsung di HP Anda.</li>
        </ol>
      </div>
    </div>
  );
}
