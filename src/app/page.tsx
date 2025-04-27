
import Footer from '../components/Footer'
import HeroPage from '../components/HeroPage';
import EventSteps from '../components/EventSteps';
import RegisterSteps from '../components/RegisterSteps';
import Navbar from '../components/Navbar';


export default function Home() {
  return (
  
      // <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      //   <header className="pt-4 pr-4">
      //     <div className="flex justify-end">
      //       <div className="wallet-container">
      //         <Wallet>
      //           <ConnectWallet>
      //             <Avatar className="h-6 w-6" />
      //             <Name />
      //           </ConnectWallet>
      //           <WalletDropdown>
      //             <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
      //               <Avatar />
      //               <Name />
      //               <Address />
      //               <EthBalance />
      //             </Identity>
      //             <WalletDropdownLink
      //               icon="wallet"
      //               href="https://keys.coinbase.com"
      //               target="_blank"
      //               rel="noopener noreferrer"
      //             >
      //               Wallet
      //             </WalletDropdownLink>
      //             <WalletDropdownDisconnect />
      //           </WalletDropdown>
      //         </Wallet>
      //       </div>
      //     </div>
      //   </header>
      // </div>

      <>
      <Navbar />
        <HeroPage />
        <RegisterSteps />
        <EventSteps />
        <Footer />
      </>

        
      






  );
}
