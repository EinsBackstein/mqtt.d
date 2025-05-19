import SensorDataDisplay from "@/components/auto/testDisplay";
import fs from "fs";

const list = fs.readdirSync("../data");
// console.log(list);

export default function Home() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      {list.map((file) => {
        const sensorId = file.split(".")[0];
        return (
          <SensorDataDisplay notId={true} htmlId={false} verticalId={false} key={sensorId} sensorId={sensorId} />
        );
      })}
    </div>
  );
}