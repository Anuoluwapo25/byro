// AppLayout.jsx
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Providers } from "../../redux/Providers";

const AppLayout = ({ children }) => {
  return (
    <div>
      <Providers>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </Providers>
    </div>
  );
};

export default AppLayout;
