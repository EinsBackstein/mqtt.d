'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SensorDataDisplay from '@/components/auto/testDisplay';
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomPage() {
  const { id } = useParams();
  const [customPage, setCustomPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadedSensors, setLoadedSensors] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetch(`/api/user-page/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setCustomPage(data))
        .finally(() => setLoading(false));
    }, 2000);
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center">
        <Skeleton className="w-[65vw] h-[10vh] mb-4" />
        <div className="space-y-4 w-[65vw] ">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[25vh] w-full" />
          ))}
        </div>
      </div>
    );
  }
  if (!customPage) return <div>Seite nicht gefunden.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{customPage.pageName}</h1>
      <div className="space-y-4">
        {customPage.sensorIds.map((sensorId: string) => (
          <FadeInDiv
            key={sensorId}
            onVisible={() =>
              setLoadedSensors((prev) =>
                prev.includes(sensorId) ? prev : [...prev, sensorId]
              )
            }
            visible={loadedSensors.includes(sensorId)}
          >
            <SensorDataDisplay
              sensorId={sensorId}
              notId={false}
              htmlId={false}
              verticalId={false}
            />
          </FadeInDiv>
        ))}
      </div>
    </div>
  );
}

// Helper component for fade-in
function FadeInDiv({ children, onVisible, visible }: { children: React.ReactNode; onVisible: () => void; visible: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
      onVisible();
    }, 100); // slight delay for effect
    return () => clearTimeout(timeout);
  }, [onVisible]);
  return (
    <div
      className={`transition-opacity duration-700 ${show && visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}