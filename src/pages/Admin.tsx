import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  fileSize: number;
}

export default function Admin() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('Шаблон заседания');
  const [isUploading, setIsUploading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/46546ba0-b486-43a5-a4d8-96e84b07bd9a'
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTemplateFile(e.target.files[0]);
    }
  };

  const uploadTemplate = async () => {
    if (!templateFile && !editingTemplate) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл шаблона',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      let base64 = '';
      if (templateFile) {
        const arrayBuffer = await templateFile.arrayBuffer();
        base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
      }

      const body: any = { name: templateName };
      if (base64) body.fileContent = base64;
      if (editingTemplate) body.templateId = editingTemplate.id;

      const response = await fetch(
        'https://functions.poehali.dev/9bc31594-dcad-40e5-bb6a-1d05a158d00d',
        {
          method: editingTemplate ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: editingTemplate
            ? 'Шаблон обновлён'
            : 'Шаблон загружен в базу данных',
        });
        setTemplateFile(null);
        setTemplateName('Шаблон заседания');
        setEditingTemplate(null);
        loadTemplates();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка операции');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить операцию',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Удалить этот шаблон?')) return;

    try {
      const response = await fetch(
        'https://functions.poehali.dev/f63ce088-daa6-49bc-a3e6-a45cc0ad0de1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateId: id }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: 'Шаблон удалён',
        });
        loadTemplates();
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить шаблон',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateFile(null);
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setTemplateName('Шаблон заседания');
    setTemplateFile(null);
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
              Админ-панель
            </h1>
            <p className="text-xl text-muted-foreground">
              Управление шаблонами и настройки системы
            </p>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border">
              <TabsTrigger value="templates">
                <Icon name="FileText" className="mr-2" size={18} />
                Шаблоны
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Icon name="Upload" className="mr-2" size={18} />
                Загрузка
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Icon name="BarChart3" className="mr-2" size={18} />
                Статистика
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <Card className="p-6 bg-card border-border shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Список шаблонов
                  </h2>
                  <Button
                    onClick={loadTemplates}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Icon name="RefreshCw" className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
                    Обновить
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <Icon name="Loader2" className="animate-spin mx-auto mb-4 text-primary" size={48} />
                    <p className="text-muted-foreground">Загрузка...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileX" className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">Нет загруженных шаблонов</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <Icon name="FileText" className="text-primary" size={32} />
                        <div className="flex-1">
                          <p className="text-foreground font-medium text-lg">{template.name}</p>
                          <p className="text-muted-foreground text-sm">
                            Размер: {(template.fileSize / 1024).toFixed(2)} KB • 
                            Создан: {new Date(template.createdAt).toLocaleDateString('ru')} • 
                            Обновлён: {new Date(template.updatedAt).toLocaleDateString('ru')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(template)}
                            variant="outline"
                            size="sm"
                            className="text-foreground"
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            onClick={() => deleteTemplate(template.id)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <Card className="p-8 bg-card border-border shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {editingTemplate ? 'Редактирование шаблона' : 'Загрузка нового шаблона'}
                  </h2>
                  {editingTemplate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Info" size={16} />
                      <span>Редактируется: {editingTemplate.name}</span>
                      <Button
                        onClick={cancelEdit}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-primary"
                      >
                        Отменить
                      </Button>
                    </div>
                  )}
                </div>

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
                      Файл шаблона (DOCX) {editingTemplate && '(необязательно при редактировании)'}
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
                      disabled={(!templateFile && !editingTemplate) || isUploading}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg rounded-full transition-all hover:scale-105"
                    >
                      {isUploading ? (
                        <>
                          <Icon name="Loader2" className="mr-2 animate-spin" />
                          {editingTemplate ? 'Обновление...' : 'Загрузка...'}
                        </>
                      ) : (
                        <>
                          <Icon name={editingTemplate ? 'Save' : 'Database'} className="mr-2" />
                          {editingTemplate ? 'Сохранить изменения' : 'Загрузить в базу данных'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="mt-6 p-6 bg-card/50 border border-border rounded-xl">
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
                    <span>Система использует последний загруженный шаблон для генерации документов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>При редактировании можно изменить только название без замены файла</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="p-8 bg-card border-border shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Статистика системы
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-muted rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="FileText" className="text-primary" size={32} />
                      <p className="text-3xl font-bold text-white">{templates.length}</p>
                    </div>
                    <p className="text-muted-foreground">Всего шаблонов</p>
                  </div>

                  <div className="p-6 bg-muted rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="HardDrive" className="text-primary" size={32} />
                      <p className="text-3xl font-bold text-white">
                        {(templates.reduce((sum, t) => sum + t.fileSize, 0) / 1024).toFixed(1)}
                      </p>
                    </div>
                    <p className="text-muted-foreground">KB использовано</p>
                  </div>

                  <div className="p-6 bg-muted rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Clock" className="text-primary" size={32} />
                      <p className="text-3xl font-bold text-white">
                        {templates.length > 0
                          ? new Date(templates[0].updatedAt).toLocaleDateString('ru')
                          : '—'}
                      </p>
                    </div>
                    <p className="text-muted-foreground">Последнее обновление</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary/10 border border-primary/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Icon name="Lightbulb" className="text-primary mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Рекомендации
                      </h3>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Регулярно обновляйте шаблоны для актуальности данных</li>
                        <li>• Используйте понятные названия для быстрого поиска</li>
                        <li>• Удаляйте неиспользуемые шаблоны для экономии места</li>
                        <li>• Тестируйте шаблоны после загрузки</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="lg"
              className="w-full py-6 text-lg font-semibold rounded-full bg-card/50 backdrop-blur-sm"
            >
              <Icon name="Home" className="mr-2" />
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}