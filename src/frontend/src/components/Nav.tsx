'use client';
import React, { useEffect, useState } from 'react';
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
import AlertOverviewModal from '@/components/modal/alert';
import SettingsModal from '@/components/modal/settings';

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
  const [alertCount, setAlertCount] = useState(0);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // --- Trend state ---
  const [userSettings, setUserSettings] = useState<{
    userName: string;
    sensorIds: string[];
    trend?: { sensorId: string; dataType: string; valueCount?: number | 'all' };
  }>({ userName: '', sensorIds: [] });

  // Fetch available sensors (replace with your actual API call)
  useEffect(() => {
    fetch('/api/sensors/list')
      .then((res) => res.json())
      .then((data) => setAvailableSensors(data))
      .catch(() => setAvailableSensors([]));
  }, []);

  // Load custom pages from server-side storage
  useEffect(() => {
    fetch('/api/user-page/list')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCustomPages(data))
      .catch(() => setCustomPages([]));
  }, [isAddCustomPageOpen]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlertCount(Array.isArray(data) ? data.length : 0);
        }
      } catch {
        setAlertCount(0);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user settings (id: 1) on mount, including trend and valueCount
  useEffect(() => {
    fetch('/api/user-page/1')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data)
          setUserSettings({
            userName: data.userName || '',
            sensorIds: data.sensorIds || [],
            trend: data.trend, // trend may include valueCount
          });
      });
  }, [isSettingsModalOpen]);

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

        <div className="w-[90%] flex border-t border-neutral-700 mb-2 px-2" />
        {/* Custom Pages Section */}
        <div className={`${expanded ? 'p-6' : 'p-2'}`}>
          {/* --- Separator above custom pages --- */}
          {customPages.length > 0 && (
            <div
              className="flex flex-col items-center w-full"
              onClick={stopPropagation}
            >
              {customPages
                .filter((page) => page.id !== 1) // Do not display the custom page if its id is 1
                .map((page, idx) => (
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
      </div>
      {/* --- Separator above bottom 3 buttons --- */}
      <div
        className={`mt-auto mb-4 px-2 py-2 duration-300 flex flex-col ease-initial transition-all w-full ${
          expanded ? '' : ''
        }`}
        onClick={stopPropagation}
      >
        <div className="w-full flex border-t border-neutral-700 mb-2 mt-auto" />
        <div
          className="relative flex w-full py-2 overflow-visible"
          onClick={stopPropagation}
        >
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            } overflow-visible`}
            onClick={stopPropagation}
          >
            <Button
              id="notify_sm"
              onPress={() => setIsAlertModalOpen(true)}
              className="relative overflow-visible"
              disableRipple={true}
            >
              <span className="rounded-4xl cursor-pointer flex items-center justify-center relative overflow-visible">
                <Bell />
                {alertCount > 0 && (
                  <span
                    className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 z-10 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border-2 border-neutral-900"
                    style={{
                      fontSize: '0.75rem',
                      minWidth: '1.25rem',
                      minHeight: '1.25rem',
                    }}
                  >
                    {alertCount}
                  </span>
                )}
              </span>
            </Button>
          </div>
          <Button
            id="notify_lg"
            onPress={() => setIsAlertModalOpen(true)}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer relative overflow-visible"
            disableRipple={true}
          >
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer relative ${
                expanded ? 'opacity-100' : 'hidden opacity-0'
              } overflow-visible`}
            >
              <span className="relative overflow-visible">
                <Bell />
                {alertCount > 0 && (
                  <span
                    className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 z-10 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border-2 border-neutral-900"
                    style={{
                      fontSize: '0.75rem',
                      minWidth: '1.25rem',
                      minHeight: '1.25rem',
                    }}
                  >
                    {alertCount}
                  </span>
                )}
              </span>
              Notifications
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
              onPress={() => setIsSettingsModalOpen(true)}
              disableRipple={true}
            >
              <span className="rounded-4xl cursor-pointer flex items-center justify-center">
                <Settings2 />
              </span>
            </Button>
          </div>
          <Button
            id="settings_big"
            onPress={() => setIsSettingsModalOpen(true)}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer "
            disableRipple={true}
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
              onPress={() => setIsAddCustomPageOpen(true)}
              disableRipple={true}
            >
              <span className="rounded-4xl flex items-center cursor-pointer justify-center">
                <Star />
              </span>
            </Button>
          </div>
          <Button
            id="user_big"
            onPress={() => setIsAddCustomPageOpen(true)}
            className="hover:bg-neutral-800/10 hover:shadow-2xl hover:shadow-neutral-800 duration-400 transition-all cursor-pointer "
            disableRipple={true}
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
      <AlertOverviewModal
        isOpen={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        availableSensors={availableSensors}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
    </div>
  );
}
