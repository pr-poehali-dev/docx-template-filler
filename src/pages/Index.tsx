import { useState } from 'react';
import IndexWelcomeStep from '@/sections/index/index-welcome-step';
import IndexFormStep from '@/sections/index/index-form-step';
import IndexUploadStep from '@/sections/index/index-upload-step';
import { useIndexLogic } from '@/sections/index/use-index-logic';

type Step = 'welcome' | 'form' | 'upload';

export default function Index() {
  const [step, setStep] = useState<Step>('welcome');
  const {
    formData,
    previewData,
    handleFormChange,
    uploadedFiles,
    isAnalyzing,
    analyzedData,
    isProcessing,
    handleFileUpload,
    analyzeDocuments,
    generateDocument,
  } = useIndexLogic();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://cdn.poehali.dev/files/5c3377a3-e774-4d95-a591-ea4263697830.jpg)',
          filter: 'brightness(0.4)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="absolute top-8 right-8">
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-card/50 backdrop-blur-sm border border-border hover:bg-card/70 text-foreground font-semibold px-6 py-3 rounded-full flex items-center"
          >
            Админ-панель
          </button>
        </div>

        {step === 'welcome' && (
          <IndexWelcomeStep onStart={() => setStep('form')} />
        )}

        {step === 'form' && (
          <IndexFormStep
            formData={formData}
            previewData={previewData}
            onChange={handleFormChange}
            onNext={() => setStep('upload')}
          />
        )}

        {step === 'upload' && (
          <IndexUploadStep
            uploadedFiles={uploadedFiles}
            analyzedData={analyzedData}
            isAnalyzing={isAnalyzing}
            isProcessing={isProcessing}
            onBack={() => setStep('form')}
            onAnalyze={analyzeDocuments}
            onGenerate={generateDocument}
            onFileUpload={handleFileUpload}
          />
        )}
      </div>
    </div>
  );
}
