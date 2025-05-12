import SensorDataDisplay from "@/components/auto/testDisplay";
import fs from "fs";

const list = fs.readdirSync("../sensor-data");
console.log(list);

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
        {/* <SensorDataDisplay sensorId="6840" />
        <SensorDataDisplay sensorId="6521" /> */}
      {list.map((file) => {
        const sensorId = file.split(".")[0];
        return (
          <SensorDataDisplay key={sensorId} sensorId={sensorId} />
        );
      })}
    </div>
  );
}