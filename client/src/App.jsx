import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PodcastPlayer from './components/PodcastPlayer';
import GroupChat from './components/GroupChat';
import UserRegistrationModal from './components/UserRegistrationModal';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import './styles/App.css';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const groupChatRef = useRef(null);

  // Función para hacer scroll al mensaje del podcast en el chat
  const handleScrollToPodcast = (messageId) => {
    if (groupChatRef.current && groupChatRef.current.scrollToMessage) {
      groupChatRef.current.scrollToMessage(messageId);
    }
  };

  useEffect(() => {
    // Verificar si el usuario ya está registrado
    const storedUser = localStorage.getItem('pozoMinervaUser');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      setShowModal(true);
    }
  }, []);

  const handleRegistrationComplete = (user) => {
    setUserData(user);
    setShowModal(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Modal de registro bloqueante */}
        <UserRegistrationModal
          show={showModal}
          onComplete={handleRegistrationComplete}
        />

        {/* Navbar fijo */}
        <Navbar />

        {/* Contenido principal */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/documentos" element={<DocumentsPage />} />
            {/* Agregar más rutas según sea necesario */}
            <Route path="*" element={<div className="container section"><h2>Página en construcción</h2><p>Esta sección estará disponible próximamente.</p></div>} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Reproductor de podcast sticky */}
        <PodcastPlayer
          onScrollToPodcast={handleScrollToPodcast}
        />

        {/* Chat Grupal - solo visible si el usuario está registrado */}
        {userData && <GroupChat ref={groupChatRef} userData={userData} />}
      </div>
    </Router>
  );
}

export default App;
