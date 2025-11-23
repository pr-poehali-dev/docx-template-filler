import { Card } from '@/components/ui/card';

interface AnalyzedDataDisplayProps {
  analyzedData: any[];
}

export default function AnalyzedDataDisplay({ analyzedData }: AnalyzedDataDisplayProps) {
  if (analyzedData.length === 0) return null;

  return (
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
  );
}
