
import NewHeroPage from "../components/NewHeroPage";
import EventSteps from "../components/EventSteps";
import RegisterSteps from "../components/RegisterSteps";

import HappeningEvents from "../components/HappeningEvents"



export default function Home() {
  return (
    <>

      <NewHeroPage />

      <HappeningEvents />
      <RegisterSteps />
      <EventSteps />

    </>
  );
}

