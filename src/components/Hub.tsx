import { motion } from 'motion/react';
import { 
  FileText, 
  Calculator, 
  ChevronRight,
} from 'lucide-react';

export type AppId = 'hub' | 'afd' | 'folha';

interface HubProps {
  onSelectApp: (app: AppId) => void;
}

export default function Hub({ onSelectApp }: HubProps) {
  const cards = [
    {
      id: 'afd' as AppId,
      name: 'Formatador de AFD',
      description: 'Padronização rápida e visualização inteligente de arquivos AFD (Fonte de Dados).',
      icon: FileText,
      color: 'text-solides-roxo',
      bgLight: 'bg-solides-roxo/10',
      border: 'border-solides-roxo/20',
      comingSoon: false,
    },
    {
      id: 'folha' as AppId,
      name: 'Eventos de Folha',
      description: 'Visualize eventos de folha de pagamento de forma simplificada e integrada.',
      icon: Calculator,
      color: 'text-solides-blue',
      bgLight: 'bg-solides-blue/10',
      border: 'border-solides-blue/20',
      comingSoon: false,
    }
  ];

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans w-full max-w-6xl mx-auto">
      
      {/* HEADER DO HUB */}
      <div className="w-full flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-solides-roxo to-solides-light flex items-center justify-center shadow-lg text-white font-bold text-2xl font-display">
            S
          </div>
          <div>
            <h1 className="text-3xl font-black text-solides-dark tracking-tight font-display">
              Sólides <span className="font-light text-slate-400">Workspace</span>
            </h1>
            <p className="text-slate-500 font-medium">Ferramentas internas integradas em um só lugar.</p>
          </div>
        </div>
      </div>

      {/* GRID DE APLICATIVOS */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => !card.comingSoon && onSelectApp(card.id)}
              disabled={card.comingSoon}
              className={`w-full text-left bg-white rounded-2xl border p-8 h-full flex flex-col transition-all duration-300 relative overflow-hidden group
                ${card.comingSoon 
                  ? 'border-slate-200 opacity-80 cursor-not-allowed' 
                  : `border-slate-200 hover:${card.border} hover:shadow-xl hover:-translate-y-1`
                }
              `}
            >
              {/* Coming Soon Badge */}
              {card.comingSoon && (
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                    Em Breve
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${card.bgLight} ${card.color}`}>
                <card.icon className="w-7 h-7" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold font-display text-slate-800 mb-3 group-hover:text-solides-dark transition-colors pr-10">
                {card.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                {card.description}
              </p>

              {/* Action Link Footer */}
              {!card.comingSoon && (
                <div className={`flex items-center gap-1 text-sm font-semibold mt-auto ${card.color} opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300`}>
                  Acessar ferramenta <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
