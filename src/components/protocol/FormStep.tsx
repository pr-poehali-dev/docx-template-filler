import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface FormStepProps {
  formData: {
    date: string;
    meetingNumber: string;
    protocolCount: string;
    firstProtocolNumber: string;
  };
  templateFile: File | null;
  isProcessing: boolean;
  onFormChange: (field: string, value: string) => void;
  onTemplateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateRemove: () => void;
  onGenerateDocument: () => void;
  onContinue: () => void;
}

export default function FormStep({
  formData,
  templateFile,
  isProcessing,
  onFormChange,
  onTemplateUpload,
  onTemplateRemove,
  onGenerateDocument,
  onContinue,
}: FormStepProps) {
  return (
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
                    onClick={onTemplateRemove}
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
                    onChange={onTemplateUpload}
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
              onChange={(e) => onFormChange('date', e.target.value)}
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
              onChange={(e) => onFormChange('meetingNumber', e.target.value)}
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
              onChange={(e) => onFormChange('protocolCount', e.target.value)}
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
              onChange={(e) => onFormChange('firstProtocolNumber', e.target.value)}
              className="bg-input border-border text-foreground h-14 text-lg"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            onClick={onGenerateDocument}
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
            onClick={onContinue}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-6 text-lg rounded-full transition-all hover:scale-105"
          >
            Продолжить
            <Icon name="ArrowRight" className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
