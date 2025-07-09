import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Layout from './components/Layout';
import SingleArtistPage from "./pages/SingleArtistPage.jsx"; 

import { useAuth } from './contexts/AuthContext';


function App() {
  const { isInitialized } = useAuth();
    
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }
  return (
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<HomePage />} />
            <Route path="people/:id" element={<SingleArtistPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
  );
}

export default App;
