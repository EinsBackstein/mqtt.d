'use client';
import React from 'react';
import { useState } from 'react';
import { House, LayoutDashboard, Star, MonitorSpeaker, HousePlus, Info, Bell, Settings2, UserRound } from 'lucide-react';

import { Button } from '@heroui/button';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathName = usePathname();

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
      <div className="flex flex-col items-center w-full" onClick={stopPropagation}>
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
            router.push('/favourites');
          }}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/3 text-left w-20 transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Favourites
          </span>
          <span
            className={`transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Star />
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
      </div>

      <div
        className={`mt-auto mb-4 px-2.5 py-2 hover:bg-neutral-800 duration-300 flex flex-col ease-initial transition-all w-full ${
          expanded ? '' : ''
        }`}
        onClick={stopPropagation}
      >
        <div className="relative flex w-full py-2">
          <Button id="info_lg" onPress={() => { router.push(`${pathName}/?info=true`) }}>
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0 p-0'
              }`}
            >
              <Info /> Help/Info
            </span>
          </Button>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button id="info_sm" onPress={() => { router.push(`${pathName}/?info=true`) }}>
              <span className="rounded-4xl bg-primary flex items-center justify-center">
                <Info />
              </span>
            </Button>
          </div>
        </div>
        <div className="relative flex w-full  py-2">
          <Button id="notify_lg" onPress={() => { router.push(`${pathName}/?notifications=true`) }}>
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0'
              }`}
            >
              <Bell /> Notifications
            </span>
          </Button>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button id="notify_sm" onPress={() => { router.push(`${pathName}/?notifications=true`) }}>
              <span className="rounded-4xl bg-primary flex items-center justify-center">
                <Bell />
              </span>
            </Button>
          </div>
        </div>
        <div className="relative flex w-full py-2">
          <Button id="settings_big" onPress={() => { router.push(`${pathName}/?settings=true`) }}>
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0'
              }`}
            >
              <Settings2 /> Settings
            </span>
          </Button>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button id="Settings_sm" onPress={() => { router.push(`${pathName}/?settings=true`) }}>
              <span className="rounded-4xl bg-primary flex items-center justify-center">
                <Settings2 />
              </span>
            </Button>
          </div>
        </div>
        <div className="flex w-full py-2">
          <Button id="user_big" onPress={() => { router.push(`${pathName}/?user=true`) }}>
            <span
              className={`flex flex-row items-center gap-2 transition-opacity duration-200 justify-start hover:cursor-pointer ${
                expanded ? 'opacity-100' : 'hidden opacity-0'
              }`}
            >
              <UserRound /> User
            </span>
          </Button>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'hidden opacity-0' : 'opacity-100'
            }`}
          >
            <Button id="user_small" onPress={() => { router.push(`${pathName}/?user=true`) }}>
              <span className="rounded-4xl bg-primary flex items-center justify-center">
                <UserRound />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
