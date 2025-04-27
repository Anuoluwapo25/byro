import Footer from '../components/Footer'
import HeroPage from '../components/HeroPage';
import EventSteps from '../components/EventSteps';
import RegisterSteps from '../components/RegisterSteps';
import Navbar from '../components/Navbar';


export default function Home() {
  return (
    <>
    <Navbar />
     <HeroPage />
     <RegisterSteps />
     <EventSteps />
    <Footer />
    </>
   
  );
}
