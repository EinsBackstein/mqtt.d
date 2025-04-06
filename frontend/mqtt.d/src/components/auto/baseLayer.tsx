import { Button } from '@heroui/button'
import { MoveRight, RefreshCcw, Settings, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'

type BaseLayerProps = {
  icon: React.ReactNode,
  heading: string,
  id: string,
  value: string | number,
  lastValue?: string | number,
  timeStamp?: string,
  statusColor?: string,
}

const BaseLayer = ({icon,heading, id, value, lastValue, timeStamp, statusColor}:BaseLayerProps) => {

  if(!id.startsWith("#")){
    id = "#" + id;
  }

  if(!lastValue){
    lastValue = "No reference point yet";
  }

  let upDown;
  if (lastValue === value){
    upDown = <p className="text-sm"><MoveRight /></p>;
  }else if (lastValue < value){
    upDown = <p className="text-sm"><TrendingUp /></p>;
  }else if (lastValue > value){
    upDown = <p className="text-sm"><TrendingDown /></p>;
  }else{
    upDown = <p className="text-sm">How did we get here?</p>;
  }

  const diff = Number(value) - Number(lastValue);
  let diffPositive;

  if (diff > 0){
    diffPositive ="+"
  }else if (diff < 0){
    diffPositive = ""
  }
  else{
    diffPositive = "+/- "
  }

  return (
    <div className={`flex flex-row items-center justify-center w-[450px] h-[180px] bg-secondary rounded-4xl ring-1 ring-${statusColor}/20 shadow-md shadow-${statusColor}/30 p-4`}>
      <div className="flex flex-col w-full h-full pt-4">
        <div className="flex flex-row items-end gap-4 pb-2">
          <h1 className="text-xl flex flex-row gap-4 justify-center items-center text-left font-semibold text-white">
            {icon}{heading}
          </h1>
          <p className="text-xs text-left  text-white/20">ID: {id}</p>
        </div>
        <div className={`text-3xl text-${statusColor} flex flex-row items-center  gap-3 font-bold pb-0.5`}>{value} {upDown}</div>
        <p className="text-sm text-white/35">{diffPositive}{diff} seit letzer Messung</p>
        <p className="text-sm text-white/25 italic">{timeStamp}</p>
      </div>
      <div>
        <Button isIconOnly className=" rounded-4xl text-2xl">
          <Settings />
        </Button>
        <Button isIconOnly className="rounded-md text-2xl">
          <RefreshCcw />
        </Button>
      </div>
    </div>
  )
}

export default BaseLayer