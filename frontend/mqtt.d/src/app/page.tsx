import CO2 from "@/components/static/co2";
import Temperatur from "@/components/static/temp";


export default function Home() {
  return (
    <div className="flex flex-col gap-5">
      <h1>Home</h1>
      <Temperatur />
      <CO2 />
    </div>
  );
}
