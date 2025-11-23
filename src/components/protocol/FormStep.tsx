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
  isProcessing: boolean;
  onFormChange: (field: string, value: string) => void;
  onGenerateDocument: () => void;
  onContinue: () => void;
}

export default function FormStep({
  formData,
  isProcessing,
  onFormChange,
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