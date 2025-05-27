'use client';
import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  House,
  LayoutDashboard,
  Star,
  MonitorSpeaker,
  HousePlus,
  Info,
  Bell,
  Settings2,
  UserRound,
  FilePlus2,
} from 'lucide-react';
import AddCustomSensorPage from './addUserCustomPage';
import { Button } from '@heroui/button';
import { usePathname, useRouter } from 'next/navigation';

const exampleSensors = [
  { sensorID: '1001', sensorName: 'Wohnzimmer Temperatur' },
  { sensorID: '1002', sensorName: 'Schlafzimmer Luftfeuchtigkeit' },
  { sensorID: '1003', sensorName: 'Küche CO2' },
  { sensorID: '1004', sensorName: 'Balkon Helligkeit' },
  { sensorID: '6840', sensorName: 'Keller Luftdruck' },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  const [isAddCustomPageOpen, setIsAddCustomPageOpen] = useState(false);
  const [availableSensors, setAvailableSensors] = useState<
    Array<{ sensorID: string; sensorName: string }>
  >([]);
  const [customPages, setCustomPages] = useState<
    { id: number; pageName: string; sensorIds: string[] }[]
  >([]);

  // Fetch available sensors (replace with your actual API call)
  useEffect(() => {
    // Example fetch, replace with your real API
    fetch('/api/sensors/list')
      .then((res) => res.json())
      .then((data) => setAvailableSensors(data))
      .catch(() => setAvailableSensors([]));
  }, []);

  // Load custom pages from localStorage
  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem('customSensorPages') || '[]');
    setCustomPages(pages);
  }, [isAddCustomPageOpen]); // reload when modal closes

  const handleContainerClick = () => {
    setExpanded(!expanded);
  };

  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className={`flex sticky mr-4 top-0 items-center h-screen flex-col
      duration-200 ease-in-out transition-all ${
        expanded ? 'w-50 text-left' : 'w-12'
      } bg-neutral-900 text-white`}
      onClick={handleContainerClick}
    >
      <div
        className="flex flex-col items-center w-full"
        onClick={stopPropagation}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/');
          }}
          className="p-4 focus:outline-none relative hover:"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Home
          </span>
          <span
            className={`transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <House />
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/showcase');
          }}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Dashboard
          </span>
          <span
            className={`transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <LayoutDashboard />
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/addSensor');
          }}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Hinzufügen
          </span>
          <span
            className={`transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <FilePlus2 />
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/devices');
          }}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Devices
          </span>
          <span
            className={`transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <MonitorSpeaker />
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/rooms');
          }}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Rooms
          </span>
          <span
            className={`transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <HousePlus />
          </span>
        </button>

        {/* Custom Pages Section */}
        {customPages.length > 0 && (
          <div
            className="flex flex-col items-center w-full"
            onClick={stopPropagation}
          >
            {customPages.map((page, idx) => (
              <button
                key={page.id}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/custom/${page.id}`);
                }}
                className="p-4 focus:outline-none relative"
                title={!expanded ? page.pageName : undefined}
              >
                <span
                  className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
                    expanded ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {page.pageName}
                </span>
                <span
                  className={`flex items-center justify-center transition-opacity duration-200 ${
                    expanded ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <Star className="w-6 h-6" />
                  <span className="ml-2 text-sm">{`${idx + 1}`}</span>
                  {/* Tooltip for accessibility, always present */}
                  <span className="sr-only">{page.pageName}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        className={`mt-auto mb-4 px-2.5 py-2 duration-300 flex flex-col ease-initial transition-all w-full ${
          expanded ? '' : ''
        }`}
        onClick={stopPropagation}
      >
        <div className="relative flex w-full py-2">
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
            onClick={stopPropagation}
          >
            <Button
              id="info_sm"
              onPress={() => {
                router.push(`${pathName}/?info=true`);
              }}
            >
              <span className="rounded-4xl cursor-pointer flex items-center justify-center">
                <Info />
              </span>
            </Button>
          </div>
          <Button
            id="info_lg"
            onClick={() => {
              router.push(`${pathName}/?info=true`);
            }}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer "
          >
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0 p-0'
              }`}
            >
              <Info /> Help/Info
            </span>
          </Button>
        </div>
        <div className="relative flex w-full  py-2" onClick={stopPropagation}>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button
              id="notify_sm"
              onPress={() => {
                router.push(`${pathName}/?notifications=true`);
              }}
            >
              <span className="rounded-4xl cursor-pointer flex items-center justify-center">
                <Bell />
              </span>
            </Button>
          </div>
          <Button
            id="notify_lg"
            onPress={() => {
              router.push(`${pathName}/?notifications=true`);
            }}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer "
          >
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0'
              }`}
            >
              <Bell /> Notifications
            </span>
          </Button>
        </div>
        <div className="relative flex w-full py-2" onClick={stopPropagation}>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button
              id="settings_sm"
              onPress={() => {
                router.push(`${pathName}/?settings=true`);
              }}
            >
              <span className="rounded-4xl cursor-pointer flex items-center justify-center">
                <Settings2 />
              </span>
            </Button>
          </div>
          <Button
            id="settings_big"
            onPress={() => {
              router.push(`${pathName}/?settings=true`);
            }}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer "
          >
            <span
              className={`flex items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0'
              }`}
            >
              <Settings2 /> Settings
            </span>
          </Button>
        </div>
        <div className="flex w-full py-2" onClick={stopPropagation}>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button
              id="user_small"
              onPress={() => {
                router.push(`${pathName}/?user=true`);
              }}
            >
              <span className="rounded-4xl flex items-center cursor-pointer justify-center">
                <UserRound />
              </span>
            </Button>
          </div>
          <Button
            id="user_big"
            onPress={() => setIsAddCustomPageOpen(true)}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer "
          >
            {expanded ? (
              <div className="flex items-center">
                <Star className="mr-3" />
                <span className="transition-opacity duration-200 text-left">
                  Custom Page
                </span>
              </div>
            ) : (
              <Star />
            )}
          </Button>
        </div>
      </div>
      <AddCustomSensorPage
        isOpen={isAddCustomPageOpen}
        onOpenChange={setIsAddCustomPageOpen}
        onSuccess={() => setIsAddCustomPageOpen(false)}
        availableSensors={availableSensors}
      />
    </div>
  );
}
