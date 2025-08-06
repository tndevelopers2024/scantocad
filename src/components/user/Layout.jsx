import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Optional
import Footer from '../Footer';
const Layout = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <a
        href="https://wa.me/+917395972777"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 "
        aria-label="Chat on WhatsApp"
      >
        <img
          className="w-16 transition-transform duration-300 hover:scale-110"
          src="/img/whatsapp.png"
          alt="whatsapp icon"
        />
      </a>
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-white">
        {/* Optional Header */}
        <Header />
        <main className="flex-1 p-6 ">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
