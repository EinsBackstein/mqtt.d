'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SensorDataDisplay from '@/components/auto/testDisplay';

export default function CustomPage() {
  const { id } = useParams();
  const [customPage, setCustomPage] = useState<any>(null);

  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem('customSensorPages') || '[]');
    const page = pages.find((p: any) => String(p.id) === String(id));
    console.log('CustomPage useEffect', { id, pages, page });
    setCustomPage(page);
  }, [id]);

  if (!customPage) return <div>Seite nicht gefunden.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{customPage.pageName}</h1>
      <div className="space-y-4">
        {customPage.sensorIds.map((sensorId: string) => (
          <SensorDataDisplay
            key={sensorId}
            sensorId={sensorId}
            notId={false}
            htmlId={false}
            verticalId={false}
          />
        ))}
      </div>
    </div>
  );
}