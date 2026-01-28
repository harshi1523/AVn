import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";

interface KYCVerificationProps {
  onComplete: () => void;
  onSkip: () => void;
}

type VerificationStep = 'personal' | 'documents' | 'review';

export default function KYCVerification({ onComplete, onSkip }: KYCVerificationProps) {
  const { user, updateKYCStatus } = useStore();
  const [step, setStep] = useState<VerificationStep>('documents');
  const [docType, setDocType] = useState('Aadhaar Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const steps = [
    { id: 'personal', label: 'PERSONAL INFO' },
    { id: 'documents', label: 'DOCUMENTS' },
    { id: 'review', label: 'REVIEW' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'front') setFrontFile(e.target.files[0]);
      else setBackFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const uploadToSupabase = async (file: File, side: 'front' | 'back') => {
    if (!user) throw new Error("User not authenticated");
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.uid || 'guest'}/${docType.replace(/\s+/g, '_')}_${side}_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async () => {
    if (!frontFile || !backFile) {
        setUploadError("Please upload both front and back sides of the document.");
        return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
        const [frontPath, backPath] = await Promise.all([
            uploadToSupabase(frontFile, 'front'),
            uploadToSupabase(backFile, 'back')
        ]);

        if (user) {
            await updateKYCStatus(user.id, 'pending', {
                front: frontPath,
                back: backPath,
                type: docType
            });
        }
        
        setIsSuccess(true);
        // Wait a moment before redirecting or leave it to user to click 'Continue'
        // But per request: "wait for approve". So we show a success/pending state.
        
    } catch (error: any) {
        console.error("Upload error:", error);
        setUploadError(error.message || "Failed to upload documents. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
      return (
        <div className="min-h-screen bg-brand-page flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-[#1C1F26] border border-brand-primary/20 rounded-3xl p-8 shadow-glow animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                    <span className="material-symbols-outlined text-4xl">hourglass_top</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Documents Submitted</h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                    Your KYC documents have been securely uploaded. Our team will verify them shortly (usually within 24 hours). 
                    <br/><br/>
                    Status: <span className="text-brand-warning font-bold uppercase tracking-wider">Pending Approval</span>
                </p>
                <button onClick={onComplete} className="w-full bg-cta-gradient text-white font-bold py-4 rounded-xl">
                    Back to Dashboard
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-brand-page relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_#2A1B4A_0%,_transparent_70%)] opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between">
        <button onClick={onSkip} className="text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-white">Verify Identity</h1>
        <span className="text-xs font-medium text-gray-400">Step 2 of 3</span>
      </header>

      <main className="relative z-10 flex-1 max-w-xl mx-auto w-full px-6 pt-8 pb-24 overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">KYC Document Check</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          To ensure a secure rental experience, we need to verify your identity. Please upload a valid government-issued ID.
        </p>

        {/* Custom Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-4">
            {steps.map((s) => (
              <span 
                key={s.id} 
                className={`text-[10px] font-black tracking-widest uppercase transition-colors ${step === s.id ? 'text-brand-primary' : 'text-gray-600'}`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
            <div className={`h-full bg-brand-primary transition-all duration-700 shadow-glow ${
              step === 'personal' ? 'w-1/3' : step === 'documents' ? 'w-2/3' : 'w-full'
            }`} />
          </div>
        </div>

        {/* Data Encryption Alert */}
        <div className="bg-[#1C1F26] border border-white/5 rounded-2xl p-5 flex gap-4 mb-10">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
            <span className="material-symbols-outlined filled-icon">verified_user</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-primary mb-1">Data Encryption</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your documents are encrypted and stored securely. We never share your data without consent.
            </p>
          </div>
        </div>

        {/* Select Document Type */}
        <div className="space-y-4 mb-8">
          <label className="block text-sm font-bold text-white">Select Document Type</label>
          <div className="relative">
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-[#1C1F26] border border-white/10 rounded-2xl p-4 text-white appearance-none focus:outline-none focus:border-brand-primary transition-colors text-sm font-medium"
            >
              <option>Aadhaar Card</option>
              <option>PAN Card</option>
              <option>Voter ID</option>
              <option>Driving License</option>
              <option>Passport</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              unfold_more
            </span>
          </div>
        </div>

        {/* Upload Zones */}
        <div className="space-y-8 mb-10">
          {/* Front Side */}
          <div>
            <label className="block text-sm font-bold text-white mb-4">Front Side</label>
            <label className={`relative border-2 border-dashed ${frontFile ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-700'} rounded-3xl p-12 flex flex-col items-center justify-center group hover:border-brand-primary/40 transition-colors cursor-pointer`}>
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'front')} />
              <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center ${frontFile ? 'text-brand-success' : 'text-white/20'} group-hover:text-brand-primary transition-colors mb-4`}>
                <span className="material-symbols-outlined text-3xl">{frontFile ? 'check' : 'add_a_photo'}</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{frontFile ? frontFile.name : 'Tap to upload front'}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">JPG, PNG or PDF (Max 5MB)</p>
            </label>
          </div>

          {/* Back Side */}
          <div>
            <label className="block text-sm font-bold text-white mb-4">Back Side</label>
            <label className={`relative border-2 border-dashed ${backFile ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-700'} rounded-3xl p-12 flex flex-col items-center justify-center group hover:border-brand-primary/40 transition-colors cursor-pointer`}>
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'back')} />
              <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center ${backFile ? 'text-brand-success' : 'text-white/20'} group-hover:text-brand-primary transition-colors mb-4`}>
                <span className="material-symbols-outlined text-3xl">{backFile ? 'check' : 'add_a_photo'}</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{backFile ? backFile.name : 'Tap to upload back'}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">JPG, PNG or PDF (Max 5MB)</p>
            </label>
          </div>
        </div>
        
        {uploadError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {uploadError}
            </div>
        )}

        {/* Information Notice */}
        <div className="bg-white/5 rounded-2xl p-5 flex gap-4 mb-12">
          <span className="material-symbols-outlined text-gray-500 text-xl">info</span>
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
            Make sure the text is clear and readable. Glare or blur might cause verification failure.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-6">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-cta-gradient text-white font-black py-5 rounded-2xl shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Uploading & Verifying...' : (
              <>
                Submit Rental KYC <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
          <button onClick={onSkip} className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </main>
      
      {/* Decorative Brand Sparkle */}
      <div className="fixed bottom-6 right-6 opacity-20 pointer-events-none">
        <span className="material-symbols-outlined text-4xl text-white">auto_awesome</span>
      </div>
    </div>
  );
}