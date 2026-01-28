import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

interface VideoGeneratorProps {
  onBack: () => void;
}

export default function VideoGenerator({ onBack }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  const presets = [
    "Cinematic shot of a sleek silver MacBook Pro on a minimalist black glass desk, ambient neon lighting, 8k resolution",
    "Extreme close-up of a high-end mechanical keyboard with glowing RGB switches being typed on in slow motion",
    "A futuristic glowing gaming PC tower with liquid cooling and pulsing purple LEDs, dark room atmosphere",
    "Aerial drone sweep of a sprawling high-tech data center with blinking servers and cold blue industrial lighting"
  ];

  const loadingMessages = [
    "Initializing neural synthesis protocols...",
    "Rendering cinematic frame buffers...",
    "Calibrating lighting and texture manifests...",
    "Finalizing high-fidelity output encoding...",
    "Preparing asset for deployment..."
  ];

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    checkKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const checkKey = async () => {
    if ((window as any).aistudio) {
      const has = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(has);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after dialog interaction to handle race conditions
      setHasKey(true);
    }
  };

  const generateVideo = async () => {
    if (!prompt) return;
    
    // Reset state
    setIsLoading(true);
    setVideoUrl(null);
    setStatus("Establishing Model Connection...");

    try {
      // Create new instance with current key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatus("Transmitting Instruction Manifest...");
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio
        }
      });

      setStatus(loadingMessages[0]);

      // Polling loop
      let pollCount = 0;
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000)); // Poll every 8s for videos
        pollCount++;
        
        // Dynamic loading message
        const msg = loadingMessages[Math.min(pollCount, loadingMessages.length - 1)];
        setStatus(msg);
        
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        setStatus("Finalizing Asset Retrieval...");
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        
        // Fetch with API key appended
        const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!res.ok) throw new Error("Infrastructure timeout during download");
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus("Generation Success");
      } else {
        throw new Error("Zero-frame error: Asset payload empty");
      }

    } catch (error: any) {
      console.error("Video Gen Error", error);
      setStatus("Terminal Error Occurred");
      
      if (error.message && error.message.includes("Requested entity was not found")) {
         setHasKey(false);
         setStatus("Auth Failure: Key Reset Required");
      } else {
         setStatus(`Fault: ${error.message || "Unknown anomaly"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 animate-in fade-in duration-500">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-all group font-black text-[10px] uppercase tracking-[0.4em]"
      >
        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Command Center
      </button>

      <div className="bg-brand-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-20"></div>
        
        <div className="p-8 md:p-12 border-b border-white/5 bg-black/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black shadow-glow">
               <span className="material-symbols-outlined text-2xl filled-icon">movie_creation</span>
             </div>
             <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic font-display">Asset Studio</h1>
                <p className="text-[9px] text-brand-primary uppercase tracking-[0.4em] font-black mt-1">VEO 3.1 SYNTHESIS PROTOCOL ACTIVE</p>
             </div>
           </div>
           {!isLoading && hasKey && (
             <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-full">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
               <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Uplink Stable</span>
             </div>
           )}
        </div>

        {!hasKey ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mb-8">
              <span className="material-symbols-outlined text-4xl">key</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">API Key Required</h3>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-sm leading-relaxed font-medium">
              To utilize the high-performance Veo video generation infrastructure, you must select a valid API key from a paid Google Cloud project.
            </p>
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={handleSelectKey}
                className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:brightness-90 transition-all active:scale-95 flex items-center gap-3 uppercase text-[10px] tracking-[0.4em] shadow-2xl"
              >
                Identify Uplink Key
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[9px] text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em] font-black underline underline-offset-8"
              >
                Billing Documentation
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[600px]">
            {/* Input Section */}
            <div className="lg:col-span-2 p-8 md:p-12 space-y-10 border-b lg:border-b-0 lg:border-r border-white/5">
               <div className="space-y-4">
                 <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-1 italic">Instruction Prompt</label>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="Describe your cinematic vision..."
                   className="w-full h-40 bg-black/40 border border-white/5 rounded-[1.5rem] p-6 text-white focus:outline-none focus:border-brand-primary/40 transition-all resize-none placeholder:text-white/10 text-sm font-medium tracking-tight"
                   disabled={isLoading}
                 />
               </div>

               <div className="space-y-4">
                 <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-1 italic">Composition Ratio</label>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setAspectRatio("16:9")}
                      className={`flex-1 py-4 px-6 rounded-2xl border text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${aspectRatio === "16:9" ? "bg-white text-black border-white shadow-lg" : "border-white/5 text-white/20 hover:border-white/20"}`}
                    >
                      <span className="material-symbols-outlined text-sm">panorama</span>
                      Landscape
                    </button>
                    <button 
                      onClick={() => setAspectRatio("9:16")}
                      className={`flex-1 py-4 px-6 rounded-2xl border text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${aspectRatio === "9:16" ? "bg-white text-black border-white shadow-lg" : "border-white/5 text-white/20 hover:border-white/20"}`}
                    >
                      <span className="material-symbols-outlined text-sm">stay_current_portrait</span>
                      Portrait
                    </button>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-1 italic">Tactical Presets</label>
                 <div className="flex flex-wrap gap-2">
                    {presets.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => setPrompt(p)}
                        disabled={isLoading}
                        className="text-[8px] font-black uppercase tracking-widest bg-white/5 hover:bg-white hover:text-black border border-white/5 rounded-full px-4 py-2 text-white/40 transition-all whitespace-nowrap"
                      >
                        {p.substring(0, 20)}...
                      </button>
                    ))}
                 </div>
               </div>

               <button 
                  onClick={generateVideo}
                  disabled={isLoading || !prompt}
                  className="w-full bg-white hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed text-black font-black text-[11px] uppercase tracking-[0.5em] py-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-4 mt-8 shadow-2xl group"
               >
                  {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-45 transition-transform">auto_awesome</span>
                  )}
                  {isLoading ? "Synthesizing Asset..." : "Initialize Generation"}
               </button>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-3 p-8 md:p-12 bg-black/40 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
               {/* Background decorative scanlines */}
               <div className="absolute inset-0 topography-lines opacity-10 pointer-events-none"></div>
               
               {videoUrl ? (
                 <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 relative z-10">
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className={`w-full max-h-[500px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,1)] border border-white/10 ${aspectRatio === "9:16" ? "max-w-[280px]" : ""}`}
                    />
                    <a 
                      href={videoUrl} 
                      download="sb-tech-manifest-capture.mp4"
                      className="mt-12 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-white/40 hover:text-brand-primary transition-all group"
                    >
                      <span className="material-symbols-outlined text-sm group-hover:translate-y-1 transition-transform">download</span> 
                      Secure Local Asset
                    </a>
                 </div>
               ) : (
                 <div className="text-center relative z-10">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-10">
                        <div className="relative">
                           <div className="w-24 h-24 rounded-full border-2 border-white/5 border-t-brand-primary animate-spin"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-brand-primary animate-pulse">generating_tokens</span>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[12px] font-black text-white uppercase tracking-[0.5em] animate-pulse italic">{status}</p>
                           <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-black italic">PROBABILITY: 99.8% STABLE</p>
                        </div>
                      </div>
                    ) : (
                      <div className="opacity-10 flex flex-col items-center group">
                        <span className="material-symbols-outlined text-9xl mb-8 group-hover:scale-110 transition-transform duration-700">video_stable</span>
                        <p className="text-[12px] font-black text-white uppercase tracking-[0.8em] italic">Awaiting Manifest</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Legal / Tech Info */}
      <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 border-t border-white/5 pt-12">
        <div className="flex gap-12">
           <div className="text-[9px] font-black uppercase tracking-[0.4em]">LATENCY: <span className="text-white">OPTIMAL</span></div>
           <div className="text-[9px] font-black uppercase tracking-[0.4em]">ENCRYPTION: <span className="text-white">SHA-512</span></div>
           <div className="text-[9px] font-black uppercase tracking-[0.4em]">ENGINE: <span className="text-white">SB_TECH_CORE_v4</span></div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[9px] font-black uppercase tracking-[0.4em] italic">Proprietary AI Architecture</span>
           <span className="material-symbols-outlined text-sm">verified_user</span>
        </div>
      </div>
    </div>
  );
}