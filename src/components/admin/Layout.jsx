import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Optional
import Footer from '../Footer';
const Layout1 = () => {
  return (
    <div className="flex min-h-screen bg-white">
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

export default Layout1;
