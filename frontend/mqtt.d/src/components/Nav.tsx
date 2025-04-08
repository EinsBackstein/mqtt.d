'use client';
import React from 'react';
import { useState } from 'react';
import { House, LayoutDashboard, Star, MonitorSpeaker, HousePlus, Info, Bell, Settings2, UserRound } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@heroui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

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
      <div className='flex flex-col items-center w-full' onClick={stopPropagation}>
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
        className={`mt-auto mb-4 px-2.5 py-2 hover:bg-neutral-800 duration-300 ease-initial transition-all w-full ${
          expanded ? '' : ''
        }`}
        onClick={stopPropagation}
      >
        <div className="relative w-full">
          <Link id="user" href={'/?info=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 flex flex-row items-center justify-center gap-2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              <Info/> Help/Info
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?info=true'}>
              <div className="rounded-4xl bg-primary p-2 my-2 flex items-center justify-center">
                <Info />
              </div>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <Link id="user" href={'/?notifications=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 flex flex-row items-center justify-center gap-2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              <Bell/> Notifications
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?notifications=true'}>
              <div className="rounded-4xl bg-primary p-2 flex items-center justify-center">
                <Bell />
              </div>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <Link id="user" href={'/?settings=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 flex flex-row items-center justify-center gap-2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              <Settings2/> Settings
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?settings=true'}>
              <div className="rounded-4xl bg-primary p-2 my-2 flex items-center justify-center">
                <Settings2 />
              </div>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <Link id="user" href={'/?user=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 flex flex-row items-center justify-center gap-2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              <UserRound/> User
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <button id="user" onClick={() => {
            
            router.push('/');
          }}>
              <div className="rounded-4xl bg-primary p-2 flex items-center justify-center">
                <UserRound />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
