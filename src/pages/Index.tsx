import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

type Step = 'welcome' | 'form' | 'upload';

export default function Index() {
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    date: '',
    meetingNumber: '',
    protocolCount: '',
    firstProtocolNumber: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzedData, setAnalyzedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
      setAnalyzedData([]);
    }
  };

  const analyzeDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Загрузите файлы представлений',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    const results = [];

    try {
      for (const file of uploadedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        const response = await fetch(
          'https://functions.poehali.dev/c338775f-5af7-4c54-8469-b6fb892e5a50',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileContent: base64 }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          results.push({ fileName: file.name, ...data });
        } else {
          results.push({
            fileName: file.name,
            error: 'Не удалось проанализировать файл',
          });
        }
      }

      setAnalyzedData(results);
      toast({
        title: 'Успешно!',
        description: `Проанализировано ${results.length} файлов`,
      });
    } catch (error) {
      console.error('Ошибка анализа:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось проанализировать документы',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDocument = async () => {
    setIsProcessing(true);
    
    try {
      const templateResponse = await fetch(
        'https://functions.poehali.dev/18463e07-31f6-496f-afa7-ef62e140d181'
      );
      
      if (!templateResponse.ok) {
        throw new Error('Шаблон не найден в базе данных');
      }
      
      const templateData = await templateResponse.json();
      const templateBytes = Uint8Array.from(atob(templateData.fileContent), c => c.charCodeAt(0));
      const arrayBuffer = templateBytes.buffer;
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const protocolCount = parseInt(formData.protocolCount) || 1;
      const firstProtocolNum = parseInt(formData.firstProtocolNumber) || 1;
      const protocols = [];
      
      for (let i = 0; i < protocolCount; i++) {
        protocols.push({
          number: firstProtocolNum + i,
        });
      }

      doc.render({
        date: formData.date,
        meetingNumber: formData.meetingNumber,
        protocolCount: formData.protocolCount,
        protocols: protocols,
      });

      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      saveAs(output, `Заседание_${formData.meetingNumber}_${formData.date}.docx`);
      
      toast({
        title: 'Успешно!',
        description: 'Документ сгенерирован и загружен',
      });
    } catch (error) {
      console.error('Ошибка генерации:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать документ. Проверьте шаблон.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={generateDocument}
                  disabled={!templateFile || isProcessing}
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-full"
                >
                  {isProcessing ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Icon name="FileDown" className="mr-2" />
                      Сгенерировать документ
                    </>
                  )}
                </Button>
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

                {analyzedData.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Результаты анализа
                    </h3>
                    {analyzedData.map((data, index) => (
                      <Card key={index} className="p-6 bg-muted border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Файл</p>
                            <p className="text-foreground font-medium">{data.fileName}</p>
                          </div>
                          {data.error ? (
                            <div className="md:col-span-2">
                              <p className="text-destructive">{data.error}</p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-sm text-muted-foreground">ФИО</p>
                                <p className="text-foreground">{data.fio || 'Не найдено'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Дата рождения</p>
                                <p className="text-foreground">{data.birthDate || 'Не найдено'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Звание</p>
                                <p className="text-foreground">{data.rank || 'Не найдено'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Должность</p>
                                <p className="text-foreground">{data.position || 'Не найдено'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Воинская часть</p>
                                <p className="text-foreground">{data.militaryUnit || 'Не найдено'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Тип службы</p>
                                <p className="text-foreground">
                                  {data.serviceType === 'contract' && 'По контракту'}
                                  {data.serviceType === 'mobilization' && 'По мобилизации'}
                                  {data.serviceType === 'unknown' && 'Не определено'}
                                </p>
                              </div>
                              {data.serviceType === 'contract' && (
                                <>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Дата контракта</p>
                                    <p className="text-foreground">{data.contractDate || 'Не найдено'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Подписан</p>
                                    <p className="text-foreground">{data.contractSigner || 'Не найдено'}</p>
                                  </div>
                                </>
                              )}
                              {data.serviceType === 'mobilization' && (
                                <>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Дата мобилизации</p>
                                    <p className="text-foreground">{data.mobilizationDate || 'Не найдено'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Откуда</p>
                                    <p className="text-foreground">{data.mobilizationSource || 'Не найдено'}</p>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
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
                    onClick={analyzeDocuments}
                    disabled={uploadedFiles.length === 0 || isAnalyzing}
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg rounded-full transition-all hover:scale-105"
                  >
                    {isAnalyzing ? (
                      <>
                        <Icon name="Loader2" className="mr-2 animate-spin" />
                        Анализ...
                      </>
                    ) : (
                      <>
                        Анализ
                        <Icon name="Sparkles" className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="mt-8 text-center">
              <Button
                onClick={generateDocument}
                disabled={isProcessing}
                size="lg"
                variant="secondary"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-12 py-6 text-lg rounded-full transition-all hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    Скачайте готовое заседание
                    <Icon name="Download" className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}