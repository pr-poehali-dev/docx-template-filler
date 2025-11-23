import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type Step = 'welcome' | 'form' | 'upload';

export default function Index() {
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    date: '',
    meetingNumber: '',
    protocolCount: '',
    firstProtocolNumber: '',
  });
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTemplateFile(e.target.files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {step === 'welcome' && (
          <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
            <div className="text-center space-y-8 max-w-3xl">
              <h1 className="text-8xl font-black text-white tracking-tight">
                ФЕНИКС
              </h1>
              <p className="text-xl text-muted-foreground">
                Вас приветствует приложение для создание протоколов
              </p>
              <Button
                onClick={() => setStep('form')}
                size="lg"
                className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all hover:scale-105"
              >
                Начать работу
                <Icon name="ChevronRight" className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="max-w-5xl mx-auto py-16 animate-slide-up">
            <Card className="p-8 bg-card border-border shadow-2xl">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-white mb-2">Введите данные протокола</h2>
                <p className="text-muted-foreground">Заполните форму для создания документа</p>
              </div>

              <div className="mb-8 p-6 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon name="FileDown" size={32} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Шаблон заседания</h3>
                    <p className="text-muted-foreground text-sm mb-4">Загрузите шаблон документа DOCX для заполнения</p>
                    
                    {templateFile ? (
                      <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                        <Icon name="FileCheck" className="text-primary" />
                        <span className="text-foreground flex-1">{templateFile.name}</span>
                        <span className="text-muted-foreground text-sm">{(templateFile.size / 1024).toFixed(2)} KB</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTemplateFile(null)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="X" size={18} />
                        </Button>
                      </div>
                    ) : (
                      <Label htmlFor="template-upload" className="cursor-pointer">
                        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                          <Icon name="Upload" className="text-muted-foreground" />
                          <span className="text-foreground">Выберите файл шаблона</span>
                        </div>
                        <Input
                          id="template-upload"
                          type="file"
                          accept=".docx,.doc"
                          onChange={handleTemplateUpload}
                          className="hidden"
                        />
                      </Label>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-foreground text-base">
                    Дата проведения
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="bg-input border-border text-foreground h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="meetingNumber" className="text-foreground text-base">
                    Номер заседания
                  </Label>
                  <Input
                    id="meetingNumber"
                    type="number"
                    placeholder="124"
                    value={formData.meetingNumber}
                    onChange={(e) => handleFormChange('meetingNumber', e.target.value)}
                    className="bg-input border-border text-foreground h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="protocolCount" className="text-foreground text-base">
                    Количество протоколов
                  </Label>
                  <Input
                    id="protocolCount"
                    type="number"
                    placeholder="1"
                    value={formData.protocolCount}
                    onChange={(e) => handleFormChange('protocolCount', e.target.value)}
                    className="bg-input border-border text-foreground h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="firstProtocolNumber" className="text-foreground text-base">
                    Номер первого протокола
                  </Label>
                  <Input
                    id="firstProtocolNumber"
                    type="number"
                    placeholder="345"
                    value={formData.firstProtocolNumber}
                    onChange={(e) => handleFormChange('firstProtocolNumber', e.target.value)}
                    className="bg-input border-border text-foreground h-14 text-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep('upload')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-6 text-lg rounded-full transition-all hover:scale-105"
                >
                  Продолжить
                  <Icon name="ArrowRight" className="ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 'upload' && (
          <div className="max-w-5xl mx-auto py-16 animate-scale-in">
            <Card className="p-8 bg-card border-border shadow-2xl">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-white mb-2">Загрузите представления</h2>
                <p className="text-muted-foreground">Выберите файлы для анализа и обработки</p>
              </div>

              <div className="space-y-8">
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-muted/20">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <span className="text-lg text-foreground font-medium">
                      Нажмите для загрузки файлов
                    </span>
                    <span className="block text-muted-foreground mt-2">
                      или перетащите файлы сюда
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".docx,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      Загруженные файлы ({uploadedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-muted rounded-lg"
                        >
                          <Icon name="FileText" className="text-primary" />
                          <span className="text-foreground flex-1">{file.name}</span>
                          <span className="text-muted-foreground text-sm">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep('form')}
                    variant="outline"
                    size="lg"
                    className="flex-1 py-6 text-lg font-semibold rounded-full"
                  >
                    <Icon name="ChevronLeft" className="mr-2" />
                    Назад
                  </Button>
                  <Button
                    disabled={uploadedFiles.length === 0}
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg rounded-full transition-all hover:scale-105"
                  >
                    Анализ
                    <Icon name="Sparkles" className="ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-12 py-6 text-lg rounded-full transition-all hover:scale-105"
              >
                Скачайте готовое заседание
                <Icon name="Download" className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}