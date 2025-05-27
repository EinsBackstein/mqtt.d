import { Minus, MoveRight, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'

type BaseLayerProps = {
  icon: React.ReactNode,
  heading: string,
  id: string,
  value: string | number,
  unit: string,
  lastValue?: string | number,
  timeStamp?: React.ReactNode, // <-- allow ReactNode
  statusColor?: string,
}

const BaseLayer = ({icon,heading, id, value, unit, lastValue, timeStamp, statusColor}:BaseLayerProps) => {

  if(!id.startsWith("#")){
    id = "#" + id;
  }

  if(!lastValue){
    lastValue = "No reference point yet";
  }

  // console.log("lastValue: ", lastValue);
  // console.log("value: ", value);

  let upDown;
  if (lastValue === value){
    upDown = <p className="text-sm"><MoveRight /></p>;
  }else if (lastValue < value){
    upDown = <p className="text-sm"><TrendingUp /></p>;
  }else if (lastValue > value){
    upDown = <p className="text-sm"><TrendingDown /></p>;
  }
  if(value == "N/A" ){
    upDown = <p className="text-sm"><Minus /></p>;
    // console.log("DEBUG");
  }

  let diff = Number(value) - Number(lastValue);
  diff = Math.round(diff * 100) / 100; // Rounding to 2 decimal places
  let diffPositive;

  if (diff > 0){
    diffPositive ="+"
  }else if (diff < 0){
    diffPositive = ""
  }
  else{
    diffPositive = "+/- "
  }

  // diff = Math.(diff);
  const statusColorHex = statusColor?.replace("#", "#");

  // console.log(statusColorHex)
  return (
    <div style={{color: statusColor}} className={`flex flex-col md:flex-row items-center justify-center w-[100%] bg-secondary rounded-4xl max-h-60 ring-1 ring-[${statusColorHex}]/20 shadow-md shadow-[${statusColorHex}]/30 p-4`}>
      <div className="flex flex-col w-full h-full pt-4">
        <div className="flex flex-row items-end gap-4 pb-2">
          <h1 className="text-lg md:text-xl flex text-left font-semibold text-white">
            {icon}{heading}
          </h1>
          <p className="text-xs text-left text-white/20">ID: {id}</p>
        </div>
        <div className={`text-3xl  flex flex-row items-center  gap-3 font-bold pb-0.5`}>{value} {unit} {upDown}</div>
        <p className="text-sm text-white/35">{diffPositive}{diff} seit letzer Messung</p>
        <p className="text-sm text-white/25 italic">{timeStamp}</p>
      </div>
    </div>
  )
}


export default BaseLayer