import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('Шаблон заседания');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTemplateFile(e.target.files[0]);
    }
  };

  const uploadTemplate = async () => {
    if (!templateFile) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл шаблона',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const arrayBuffer = await templateFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const response = await fetch(
        'https://functions.poehali.dev/9bc31594-dcad-40e5-bb6a-1d05a158d00d',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: templateName,
            fileContent: base64,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: 'Шаблон загружен в базу данных',
        });
        setTemplateFile(null);
        setTemplateName('Шаблон заседания');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить шаблон',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
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

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
              Админ-панель
            </h1>
            <p className="text-xl text-muted-foreground">
              Загрузка шаблона документа в базу данных
            </p>
          </div>

          <Card className="p-8 bg-card border-border shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="template-name" className="text-foreground text-base">
                  Название шаблона
                </Label>
                <Input
                  id="template-name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Введите название шаблона"
                  className="bg-input border-border text-foreground h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground text-base">
                  Файл шаблона (DOCX)
                </Label>
                
                {templateFile ? (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                    <Icon name="FileCheck" className="text-primary" size={32} />
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{templateFile.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {(templateFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTemplateFile(null)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="X" size={20} />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="template-file" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-muted/20">
                      <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg text-foreground font-medium">
                        Нажмите для загрузки файла
                      </p>
                      <p className="text-muted-foreground mt-2">
                        или перетащите файл сюда
                      </p>
                    </div>
                    <Input
                      id="template-file"
                      type="file"
                      accept=".docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </Label>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={uploadTemplate}
                  disabled={!templateFile || isUploading}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg rounded-full transition-all hover:scale-105"
                >
                  {isUploading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Database" className="mr-2" />
                      Загрузить в базу данных
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="lg"
                  className="w-full py-6 text-lg font-semibold rounded-full"
                >
                  <Icon name="Home" className="mr-2" />
                  Вернуться на главную
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 p-6 bg-card/50 border border-border rounded-xl">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Info" size={20} className="text-primary" />
              Инструкция
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Загружаемый шаблон должен быть в формате DOCX</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>В шаблоне используйте переменные: {'{date}'}, {'{meetingNumber}'}, {'{#protocols}'}, {'{number}'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Новый шаблон заменит предыдущий при генерации документов</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
