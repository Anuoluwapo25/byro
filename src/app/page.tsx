import Footer from './components/Footer'
import HeroPage from './components/HeroPage';
import EventSteps from './components/EventSteps';
import RegisterSteps from './components/RegisterSteps';

export default function Home() {
  return (
    <>
     <HeroPage />
     <RegisterSteps />
     <EventSteps />
    {/* <Footer /> */}
    </>
   
  );
}
