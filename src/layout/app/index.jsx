// AppLayout.jsx
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AppLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
