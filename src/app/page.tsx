
import NewHeroPage from "../components/NewHeroPage";
import EventSteps from "../components/EventSteps";
import RegisterSteps from "../components/RegisterSteps";
// import RegisterModal from "../components/auth/RegisterModal"
import HappeningEvents from "../components/HappeningEvents"



export default function Home() {
  return (
    <>

      <NewHeroPage />
      {/* <RegisterModal /> */}
      <HappeningEvents />
      <RegisterSteps />
      <EventSteps />

    </>
  );
}

