import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Hub, { AppId } from './components/Hub';
import FormatadorAFD from './components/FormatadorAFD';
import EventosFolha from './components/EventosFolha';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [currentApp, setCurrentApp] = useState<AppId>('hub');

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firebase connected successfully");
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">

      <AnimatePresence mode="wait">
        {currentApp === 'hub' && (
          <Hub key="hub" onSelectApp={setCurrentApp} />
        )}
        {currentApp === 'afd' && (
          <FormatadorAFD key="afd" onBack={() => setCurrentApp('hub')} />
        )}
        {currentApp === 'folha' && (
          <EventosFolha key="folha" onBack={() => setCurrentApp('hub')} />
        )}
      </AnimatePresence>
    </div>
  );
}

