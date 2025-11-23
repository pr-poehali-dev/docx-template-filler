import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeStepProps {
  onContinue: () => void;
}

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
      <div className="text-center space-y-8 max-w-3xl">
        <h1 className="text-8xl font-black text-white tracking-tight">
          ФЕНИКС
        </h1>
        <p className="text-xl text-muted-foreground">
          Вас приветствует приложение для создание протоколов
        </p>
        <Button
          onClick={onContinue}
          size="lg"
          className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all hover:scale-105"
        >
          Начать работу
          <Icon name="ChevronRight" className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
