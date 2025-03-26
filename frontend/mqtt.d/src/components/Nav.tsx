'use client';
import React from 'react';
import { useState } from 'react';

import Link from 'next/link';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`flex sticky mr-4 items-center h-screen top-0 flex-col overflow-hidden 
      duration-200 ease-in-out transition-all ${
        expanded ? 'w-50 text-left' : 'w-12'
      } bg-neutral-900 text-white`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className='flex flex-col items-center w-full'>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-left w-20 transition-opacity duration-200 ${
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
            🏠
          </span>
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-left w-20 transition-opacity duration-200 ${
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
            📱
          </span>
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-left w-20 transition-opacity duration-200 ${
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
            ⭐
          </span>
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-left w-20 transition-opacity duration-200 ${
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
            💻
          </span>
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-4 focus:outline-none relative"
        >
          <span
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-left w-20 transition-opacity duration-200 ${
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
            🏘️
          </span>
        </button>
      </div>

      <div
        className={`mt-auto mb-4 px-2.5 py-2 hover:bg-neutral-800 duration-300 ease-initial transition-all w-full ${
          expanded ? '' : ''
        }`}
      >
        <div className="relative w-full">
          <Link id="user" href={'/?user=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              ❓ Help/Info
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?user=true'}>
              <div className="rounded-4xl bg-primary p-2 my-2 flex items-center justify-center">
                ❓
              </div>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <Link id="user" href={'/?user=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              🔔 Notifications
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?user=true'}>
              <div className="rounded-4xl bg-primary p-2 flex items-center justify-center">
                🔔
              </div>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <Link id="user" href={'/?user=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              ⚙️ Settings
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?user=true'}>
              <div className="rounded-4xl bg-primary p-2 my-2 flex items-center justify-center">
                ⚙️
              </div>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <Link id="user" href={'/?user=true'}>
            <span
              className={`absolute top-1/2 transform -translate-y-1/2 left-2.5 transition-opacity duration-200 hover:cursor-pointer ${
                expanded ? 'opacity-100 ' : 'opacity-0'
              }`}
            >
              🙋🏼‍♂️ User
            </span>
          </Link>
          <div
            className={`flex justify-center items-center transition-opacity duration-200 ${
              expanded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link id="user" href={'/?user=true'}>
              <div className="rounded-4xl bg-primary p-2 flex items-center justify-center">
                🙋🏼‍♂️
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
