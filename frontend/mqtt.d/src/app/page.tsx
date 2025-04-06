import Pressure from "@/components/static/airpressure";
import CO2 from "@/components/static/co2";
import Humidity from "@/components/static/humidity";
import Brightness from "@/components/static/lightlevel";
import Temperatur from "@/components/static/temp";


export default function Home() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      <h1>Home</h1>
      <Temperatur />
      <CO2 />
      <Humidity />
      <Brightness />
      <Pressure />
    </div>
  );
}