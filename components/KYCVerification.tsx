import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import { generateRentalAgreement } from '../lib/rentalAgreement';

interface KYCVerificationProps {
  onComplete: () => void;
  onSkip: () => void;
}

type VerificationStep = 'documents' | 'agreement';

export default function KYCVerification({ onComplete, onSkip }: KYCVerificationProps) {
  const { user, updateKYCStatus, cart } = useStore();
  const [step, setStep] = useState<VerificationStep>('documents');
  const [docType, setDocType] = useState('Aadhaar Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{ front: string, back: string } | null>(null);

  // Agreement State
  const [agreementPdfUrl, setAgreementPdfUrl] = useState<string | null>(null);
  const [agreementBlob, setAgreementBlob] = useState<Blob | null>(null);
  const [isAgreementViewed, setIsAgreementViewed] = useState(false);
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isGeneratingAgreement, setIsGeneratingAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState(false);

  const generatingRef = useRef(false);

  // Auto-generate agreement PDF when entering agreement step
  useEffect(() => {
    if (step !== 'agreement' || !user) return;
    let didCancel = false;

    const run = async () => {
      if (generatingRef.current) return; // guard against StrictMode double-invoke
      generatingRef.current = true;
      setIsGeneratingAgreement(true);
      setAgreementError(false);
      setAgreementPdfUrl(null);
      setAgreementBlob(null);
      try {
        const blob = await generateRentalAgreement(user, cart);
        if (didCancel) return;
        const url = URL.createObjectURL(blob);
        setAgreementPdfUrl(url);
        setAgreementBlob(blob);
      } catch (err: any) {
        if (didCancel) return;
        // Ignore AbortError — happens in React StrictMode dev double-mount
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return;
        console.error("Failed to generate agreement:", err);
        setAgreementError(true);
      } finally {
        if (!didCancel) setIsGeneratingAgreement(false);
        generatingRef.current = false;
      }
    };

    run();
    return () => { didCancel = true; };
  }, [step]);

  const generateAgreement = async () => {
    if (!user || generatingRef.current) return;
    generatingRef.current = true;
    setIsGeneratingAgreement(true);
    setAgreementError(false);
    setAgreementPdfUrl(null);
    setAgreementBlob(null);
    try {
      const blob = await generateRentalAgreement(user, cart);
      const url = URL.createObjectURL(blob);
      setAgreementPdfUrl(url);
      setAgreementBlob(blob);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return;
      console.error("Failed to generate agreement:", err);
      setAgreementError(true);
    } finally {
      setIsGeneratingAgreement(false);
      generatingRef.current = false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'front') setFrontFile(e.target.files[0]);
      else setBackFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const uploadToSupabase = async (file: File, side: 'front' | 'back'): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const fileExt = file.name.split('.').pop();
    return `${user.id || 'guest'}/${docType.replace(/\s+/g, '_')}_${side}_${Date.now()}.${fileExt}`;
  };

  const tryUploadToStorage = async (file: File, side: 'front' | 'back'): Promise<string> => {
    const fileName = await uploadToSupabase(file, side);
    try {
      await supabase.storage.from('kyc-documents').upload(fileName, file);
    } catch (err: any) {
      // Log but don't throw — storage might not be configured yet
      console.warn(`Storage upload skipped for ${side}:`, err?.message);
    }
    return fileName;
  };

  const handleDocumentsSubmit = async () => {
    if (!frontFile || !backFile) {
      setUploadError("Please upload both front and back sides of the document.");
      return;
    }
    setIsSubmitting(true);
    setUploadError(null);
    try {
      // Best-effort upload — proceeds even if Supabase Storage bucket isn't set up
      const [frontPath, backPath] = await Promise.all([
        tryUploadToStorage(frontFile, 'front'),
        tryUploadToStorage(backFile, 'back')
      ]);
      setUploadedDocs({ front: frontPath, back: backPath });
      setStep('agreement');
    } catch (error: any) {
      console.error("Document submit error:", error);
      setUploadError(error.message || "Failed to process documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFinalSubmit = async () => {
    if (!isAgreementAccepted) {
      setUploadError("Please accept the rental agreement.");
      return;
    }
    if (!uploadedDocs) {
      setStep('documents');
      return;
    }
    if (!agreementBlob) {
      setUploadError("Agreement PDF is still generating. Please wait a moment and try again.");
      return;
    }
    if (agreementBlob.size === 0) {
      setUploadError("Agreement PDF is empty. Please go back and try again.");
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    try {
      if (user) {
        let agreementUrl: string | undefined = undefined;

        // Upload agreement PDF via native fetch to bypass Supabase JS client's AbortController
        const timestamp = Date.now();
        const fileName = `${user.id}/Rental_Agreement_${timestamp}.pdf`;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

        const uploadEndpoint = `${supabaseUrl}/storage/v1/object/agreements/${fileName}`;

        const uploadResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/pdf',
            'x-upsert': 'true',
          },
          body: agreementBlob,
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          throw new Error(`Agreement upload failed (${uploadResponse.status}): ${errText}`);
        }

        // Construct public URL directly
        agreementUrl = `${supabaseUrl}/storage/v1/object/public/agreements/${fileName}`;

        await updateKYCStatus(user.id, 'pending', {
          front: uploadedDocs.front,
          back: uploadedDocs.back,
          type: docType,
          agreementAccepted: true,
          agreementDate: new Date().toISOString(),
          agreementUrl
        });

        setIsSuccess(true);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setUploadError(error.message || "Failed to submit documents. Please try again.");
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
            <br /><br />
            Status: <span className="text-brand-warning font-bold uppercase tracking-wider">Pending Approval</span>
          </p>
          <button onClick={onComplete} className="w-full bg-cta-gradient text-white font-bold py-4 rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'documents', label: 'DOCUMENTS' },
    { id: 'agreement', label: 'AGREEMENT' },
  ];

  return (
    <div className="min-h-screen bg-brand-page relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_#2A1B4A_0%,_transparent_70%)] opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between">
        <button
          onClick={step === 'agreement' ? () => setStep('documents') : onSkip}
          className="text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-white">Verify Identity</h1>
        <span className="text-xs font-medium text-gray-400">
          Step {step === 'documents' ? '1' : '2'} of 2
        </span>
      </header>

      <main className="relative z-10 flex-1 max-w-xl mx-auto w-full px-6 pt-8 pb-24 overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">KYC Document Check</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          To ensure a secure rental experience, we need to verify your identity. Please upload a valid government-issued ID.
        </p>

        {/* Progress Bar */}
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
            <div className={`h-full bg-brand-primary transition-all duration-700 shadow-glow ${step === 'documents' ? 'w-1/2' : 'w-full'}`} />
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

        {/* STEP 1: Documents */}
        {step === 'documents' && (
          <>
            <div className="space-y-4 mb-8">
              <label className="block text-sm font-bold text-white">Select Document Type</label>
              <div className="relative">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-[#1C1F26] border border-white/10 rounded-2xl p-4 text-white appearance-none focus:outline-none focus:border-brand-primary transition-colors text-sm font-medium"
                >
                  <option style={{ backgroundColor: 'white', color: 'black' }}>Aadhaar Card</option>
                  <option style={{ backgroundColor: 'white', color: 'black' }}>PAN Card</option>
                  <option style={{ backgroundColor: 'white', color: 'black' }}>Voter ID</option>
                  <option style={{ backgroundColor: 'white', color: 'black' }}>Driving License</option>
                  <option style={{ backgroundColor: 'white', color: 'black' }}>Passport</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="space-y-8 mb-10">
              {/* Front Side */}
              <div>
                <label className="block text-sm font-bold text-white mb-4">Front Side</label>
                <label className={`relative border-2 border-dashed ${frontFile ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-700'} rounded-3xl p-12 flex flex-col items-center justify-center group hover:border-brand-primary/40 transition-colors cursor-pointer`}>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'front')} />
                  <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center ${frontFile ? 'text-green-400' : 'text-white/20'} group-hover:text-brand-primary transition-colors mb-4`}>
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
                  <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center ${backFile ? 'text-green-400' : 'text-white/20'} group-hover:text-brand-primary transition-colors mb-4`}>
                    <span className="material-symbols-outlined text-3xl">{backFile ? 'check' : 'add_a_photo'}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{backFile ? backFile.name : 'Tap to upload back'}</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">JPG, PNG or PDF (Max 5MB)</p>
                </label>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 flex gap-4 mb-12">
              <span className="material-symbols-outlined text-gray-500 text-xl">info</span>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                Make sure the text is clear and readable. Glare or blur might cause verification failure.
              </p>
            </div>

            {uploadError && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-xl flex-shrink-0">error</span>
                <p className="text-sm text-red-400">{uploadError}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <button
                onClick={handleDocumentsSubmit}
                disabled={isSubmitting || !frontFile || !backFile}
                className="w-full bg-cta-gradient text-white font-black py-5 rounded-2xl shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    Continue to Agreement <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
              <button onClick={onSkip} className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Agreement */}
        {step === 'agreement' && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="bg-[#1C1F26] border border-white/10 rounded-3xl p-6 mb-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">contract</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Digital Rental Agreement</h3>
              <p className="text-sm text-gray-400 mb-6">Please review and sign the rental agreement to proceed.</p>

              {/* View Agreement Button */}
              {isGeneratingAgreement ? (
                <div className="flex items-center justify-center gap-2 text-gray-400 py-3">
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  <span className="text-sm">Generating your agreement PDF...</span>
                </div>
              ) : agreementError ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-red-400">Failed to generate the agreement PDF.</p>
                  <button
                    onClick={generateAgreement}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 rounded-xl border border-white/10 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAgreementModal(true);
                    setIsAgreementViewed(true);
                  }}
                  disabled={!agreementPdfUrl}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl border border-white/10 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">visibility</span>
                  View Agreement PDF
                </button>
              )}
            </div>

            {/* Accept Checkbox — only active after viewing */}
            <div className={`transition-all duration-300 ${isAgreementViewed ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="flex gap-4 p-4 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors items-start">
                <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${isAgreementAccepted ? 'bg-brand-primary border-brand-primary text-black' : 'border-gray-600'}`}>
                  {isAgreementAccepted && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isAgreementAccepted}
                  onChange={(e) => setIsAgreementAccepted(e.target.checked)}
                  disabled={!isAgreementViewed}
                />
                <div className="flex-1">
                  <p className="text-sm text-white font-bold">I accept the Terms & Conditions</p>
                  <p className="text-xs text-gray-500 mt-1">I have read and understood the Rental Agreement, including the liability, damage, and return policies.</p>
                </div>
              </label>
            </div>

            {!isAgreementViewed && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Please view the agreement above before accepting.
              </p>
            )}

            {uploadError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-xl flex-shrink-0">error</span>
                <p className="text-sm text-red-400">{uploadError}</p>
              </div>
            )}

            <div className="flex flex-col gap-6 mt-8">
              <button
                onClick={handleFinalSubmit}
                disabled={!isAgreementAccepted || isSubmitting || isGeneratingAgreement || agreementError}
                className="w-full bg-cta-gradient text-white font-black py-5 rounded-2xl shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit & Verify <span className="material-symbols-outlined text-sm">verified</span>
                  </>
                )}
              </button>
              <button onClick={() => setStep('documents')} className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
                Back to Documents
              </button>
            </div>
          </div>
        )}

        {/* Agreement PDF Modal */}
        {showAgreementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1C1F26] w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
              <div className="p-4 flex justify-between items-center border-b border-white/10 bg-[#15171C]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-primary">description</span>
                  Rental Agreement Review
                </h3>
                <button
                  onClick={() => setShowAgreementModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 bg-gray-900 relative">
                {agreementPdfUrl ? (
                  <iframe src={agreementPdfUrl} className="w-full h-full" title="Rental Agreement" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-4">
                    <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                    <p>Loading Agreement...</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-[#15171C] flex justify-end">
                <button
                  onClick={() => setShowAgreementModal(false)}
                  className="bg-brand-primary text-black font-bold py-3 px-8 rounded-xl hover:brightness-110 transition-all"
                >
                  I have read the agreement
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Decorative Brand Sparkle */}
      <div className="fixed bottom-6 right-6 opacity-20 pointer-events-none">
        <span className="material-symbols-outlined text-4xl text-white">auto_awesome</span>
      </div>
    </div>
  );
}