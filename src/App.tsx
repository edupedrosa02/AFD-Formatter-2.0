import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Hub onSelectApp={setCurrentApp} />
          </motion.div>
        )}
        {currentApp === 'afd' && (
          <motion.div key="afd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FormatadorAFD onBack={() => setCurrentApp('hub')} />
          </motion.div>
        )}
        {currentApp === 'folha' && (
          <motion.div key="folha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EventosFolha onBack={() => setCurrentApp('hub')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

