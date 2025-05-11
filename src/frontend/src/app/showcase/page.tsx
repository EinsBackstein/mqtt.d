import Pressure from "@/components/static/airpressure";
import BaseLayer from "@/components/auto/baseLayer";
import CO2 from "@/components/static/co2";
import Humidity from "@/components/static/humidity";
import Brightness from "@/components/static/lightlevel";
import Temperatur from "@/components/static/temp";


import { Settings } from 'lucide-react'
import SensorDataDisplay from "@/components/auto/testDisplay";



const icon = <Settings/>;
const titleTest = "Test-Display";
const idTest = "testid1";
const valueTest = 23.5;
const lastValueTest = 26;
const timeStampTest = "2023-10-01 12:00:00";
const statusColorTest = "danger";

export default function Home() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      <h1>Home</h1>
      {/* <BaseLayer icon={icon} heading={titleTest} id={idTest} value={valueTest} lastValue={lastValueTest} timeStamp={timeStampTest} statusColor={statusColorTest}/>
      <Temperatur />
      <CO2 />
      <Humidity />
      <Brightness />
      <Pressure /> */}
        <SensorDataDisplay sensorId="6840" />
        {/* <SensorDataDisplay sensorId="6521" /> */}
    </div>
  );
}