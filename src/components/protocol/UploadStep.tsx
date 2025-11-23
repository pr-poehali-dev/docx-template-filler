import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import AnalyzedDataDisplay from './AnalyzedDataDisplay';

interface UploadStepProps {
  uploadedFiles: File[];
  analyzedData: any[];
  isAnalyzing: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onBack: () => void;
}

export default function UploadStep({
  uploadedFiles,
  analyzedData,
  isAnalyzing,
  onFileUpload,
  onAnalyze,
  onBack,
}: UploadStepProps) {
  return (
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
              onChange={onFileUpload}
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

          <AnalyzedDataDisplay analyzedData={analyzedData} />

          <div className="flex gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              className="flex-1 py-6 text-lg font-semibold rounded-full"
            >
              <Icon name="ChevronLeft" className="mr-2" />
              Назад
            </Button>
            <Button
              onClick={onAnalyze}
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
          size="lg"
          variant="secondary"
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-12 py-6 text-lg rounded-full transition-all hover:scale-105"
        >
          Скачайте готовое заседание
          <Icon name="Download" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
