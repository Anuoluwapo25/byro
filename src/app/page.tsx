import NewHeroPage from "../components/NewHeroPage";
import EventSteps from "../components/EventSteps";
import RegisterSteps from "../components/RegisterSteps";
// import RegisterModal from "../components/auth/RegisterModal"
import HappeningEvents from "../components/HappeningEvents";
import App from "next/app";
import AppLayout from "@/layout/app";

export default function Home() {
  return (
    <AppLayout>
      {" "}
      <>
        <NewHeroPage />
        {/* <RegisterModal /> */}
        <HappeningEvents />
        <RegisterSteps />
        <EventSteps />
      </>
    </AppLayout>
  );
}
