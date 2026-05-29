import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertTriangle, Upload, RefreshCw, AlertCircle, Inbox, Settings } from 'lucide-react';

type LayoutId = 'dominio' | 'alterdata' | 'questor' | 'contmatic' | 'sci_antigo' | 'sci_novo';

interface CampoConfig {
  label: string;
  nome: string;
  inicio?: number;
  fim?: number;
  class: string;
  formatType?: string;
}

interface LayoutConfig {
  nome: string;
  tipo: 'posicional' | 'delimitado';
  tamanhoLinha?: number;
  delimitador?: string;
  campos: CampoConfig[];
}

const LAYOUTS: Record<LayoutId, LayoutConfig> = {
  dominio: {
      nome: "Domínio Sistemas", tipo: "posicional", tamanhoLinha: 43,
      campos: [
          { label: "Ind.", nome: "indicador", inicio: 0, fim: 2, class: "text-solides-roxo font-bold" },
          { label: "Cód. Colab", nome: "cod_colaborador", inicio: 2, fim: 12, class: "" },
          { label: "Comp.", nome: "competencia", inicio: 12, fim: 18, class: "" },
          { label: "Evento", nome: "cod_evento", inicio: 18, fim: 22, class: "font-bold" },
          { label: "Proc.", nome: "tipo_processo", inicio: 22, fim: 24, class: "" },
          { label: "Valor", nome: "valor", inicio: 24, fim: 33, class: "text-right font-bold text-emerald-600", formatType: 'currency' },
          { label: "Filial", nome: "cod_filial", inicio: 33, fim: 43, class: "text-slate-400" },
      ]
  },
  alterdata: {
      nome: "Alterdata", tipo: "posicional", tamanhoLinha: 61,
      campos: [
          { label: "Linha", nome: "n_linha", inicio: 0, fim: 6, class: "text-slate-400" },
          { label: "Empresa", nome: "cod_empresa", inicio: 6, fim: 11, class: "" },
          { label: "Início", nome: "dt_inicio", inicio: 11, fim: 17, class: "", formatType: 'date6' },
          { label: "Fim", nome: "dt_fim", inicio: 17, fim: 23, class: "", formatType: 'date6' },
          { label: "Faltas", nome: "faltas", inicio: 23, fim: 29, class: "" },
          { label: "H. Trab", nome: "horas_trab", inicio: 29, fim: 35, class: "" },
          { label: "D. Úteis", nome: "dias_uteis", inicio: 35, fim: 37, class: "" },
          { label: "Evento", nome: "cod_evento", inicio: 37, fim: 40, class: "text-solides-roxo font-bold" },
          { label: "Valor", nome: "valor_evento", inicio: 40, fim: 54, class: "text-right font-bold text-emerald-600", formatType: 'alterdataValue' },
          { label: "Colaborador", nome: "cod_colab", inicio: 54, fim: 60, class: "font-bold" },
          { label: "Fix", nome: "fixo", inicio: 60, fim: 61, class: "text-center text-slate-400" },
      ]
  },
  questor: {
      nome: "Questor", tipo: "delimitado", delimitador: ";",
      campos: [
          { label: "Filial (Ext)", nome: "cod_filial", class: "text-slate-500" },
          { label: "Colab (Ext)", nome: "cod_colab", class: "text-solides-roxo font-bold" },
          { label: "Evento", nome: "cod_evento", class: "font-bold" },
          { label: "Valor", nome: "valor", class: "text-right font-bold text-emerald-600" },
      ]
  },
  contmatic: {
      nome: "Contmatic Phoenix", tipo: "posicional", tamanhoLinha: 99,
      campos: [
          { label: "Cód. Empregado", nome: "cod_empregado", inicio: 0, fim: 10, class: "text-solides-roxo font-bold" },
          { label: "Cód. Local", nome: "cod_local", inicio: 10, fim: 15, class: "" },
          { label: "Cód. Evento", nome: "cod_evento", inicio: 15, fim: 20, class: "font-bold" },
          { label: "Valor Evento", nome: "valor", inicio: 20, fim: 35, class: "text-right font-bold text-emerald-600", formatType: 'currency' },
          { label: "Tipo Empr.", nome: "tipo_empr", inicio: 35, fim: 37, class: "text-center text-slate-400" },
          { label: "Data Prestação", nome: "dt_prestacao", inicio: 37, fim: 47, class: "" },
          { label: "Descrição", nome: "descricao", inicio: 47, fim: 97, class: "text-slate-300 italic text-[10px]" },
          { label: "Status Recibo", nome: "status", inicio: 97, fim: 99, class: "text-center text-slate-400" }
      ]
  },
  sci_antigo: {
      nome: "SCI - Layout Antigo", tipo: "posicional", tamanhoLinha: 41,
      campos: [
          { label: "Filial", nome: "filial", inicio: 0, fim: 4, class: "text-slate-400" },
          { label: "Colaborador", nome: "colab", inicio: 4, fim: 10, class: "text-solides-roxo font-bold" },
          { label: "Evento", nome: "evento", inicio: 10, fim: 14, class: "font-bold" },
          { label: "Valor", nome: "valor", inicio: 14, fim: 19, class: "text-right font-bold text-emerald-600", formatType: 'trimNumber' },
          { label: "Competência", nome: "comp", inicio: 19, fim: 25, class: "", formatType: 'date6' },
          { label: "Data Falta", nome: "falta", inicio: 25, fim: 31, class: "text-amber-600 font-bold", formatType: 'date6' },
          { label: "Fixo", nome: "fixo", inicio: 31, fim: 41, class: "text-slate-400 text-[10px]" }
      ]
  },
  sci_novo: {
      nome: "SCI - Layout Novo", tipo: "posicional", tamanhoLinha: 30,
      campos: [
          { label: "Empresa", nome: "cod_empresa", inicio: 0, fim: 2, class: "text-slate-400" },
          { label: "Colaborador", nome: "cod_colab", inicio: 2, fim: 4, class: "text-solides-roxo font-bold" },
          { label: "Verba", nome: "cod_verba", inicio: 4, fim: 7, class: "font-bold" },
          { label: "Dt. Lançamento", nome: "dt_lancto", inicio: 7, fim: 15, class: "", formatType: 'date8' },
          { label: "Dt. Falta", nome: "dt_falta", inicio: 15, fim: 23, class: "text-amber-600 font-bold", formatType: 'date8' },
          { label: "Ref.", nome: "referencia", inicio: 23, fim: 26, class: "text-center text-solides-roxo" },
          { label: "Valor", nome: "valor", inicio: 26, fim: 30, class: "text-right font-bold text-emerald-600", formatType: 'trimNumber' }
      ]
  }
};

const formatadores: Record<string, (val: string) => string> = {
  currency: (val) => {
      const n = parseFloat(val) / 100;
      return isNaN(n) ? val : n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  },
  date6: (val) => (val && val.length === 6) ? `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4, 6)}` : val,
  date8: (val) => (val && val.length === 8) ? `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4, 8)}` : val,
  trimNumber: (val) => val ? (val.replace(/^0+/, '') || '0') : '',
  alterdataValue: (val) => {
      const totalMinutes = parseFloat(val) / 100; 
      if (!isNaN(totalMinutes) && totalMinutes > 0) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = Math.floor(totalMinutes % 60).toString().padStart(2, '0');
          return `${totalMinutes} (${hours}h${minutes}m)`;
      }
      return val ? (val.replace(/^0+/, '') || '0') : '';
  },
  default: (val) => val
};

export default function EventosFolha({ onBack }: { onBack: () => void }) {
  const [sistema, setSistema] = useState<LayoutId>('dominio');
  const [inputRaw, setInputRaw] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [registros, setRegistros] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLayout = LAYOUTS[sistema];

  function parseLinha(linha: string, layout: LayoutConfig) {
    const l = linha.replace(/\r/g, "");
    if (l.trim() === "") return null;

    if (layout.tipo === 'posicional') {
        const lFixed = l.padEnd(layout.tamanhoLinha || 0, " ");
        if (layout.tamanhoLinha && lFixed.length < layout.tamanhoLinha) {
            throw new Error(`Linha demasiado curta (${lFixed.length} chars). O layout ${layout.nome} exige ${layout.tamanhoLinha}.`);
        }
        let res: Record<string, string> = {};
        layout.campos.forEach(c => {
          if (c.inicio !== undefined && c.fim !== undefined) {
            res[c.nome] = lFixed.substring(c.inicio, c.fim);
          }
        });
        return res;
    } else {
        const partes = l.trim().split(layout.delimitador || ';');
        if (partes.length < layout.campos.length) {
            throw new Error(`Linha com colunas insuficientes. Layout esperado: ${layout.campos.map(c => c.label).join(';')}`);
        }
        let res: Record<string, string> = {};
        layout.campos.forEach((c, i) => res[c.nome] = partes[i]);
        return res;
    }
  }

  function processarDados() {
    setIsProcessing(true);
    setErrorMsg('');
    setRegistros([]);

    setTimeout(() => {
      try {
        const linhasRaw = inputRaw.split('\n');
        const parsed: any[] = [];

        linhasRaw.forEach((linha, idx) => {
            if (linha.trim() === '') return;
            try {
                const dados = parseLinha(linha, activeLayout);
                if (dados) parsed.push(dados);
            } catch (e: any) {
                throw new Error(`Erro na linha ${idx + 1}: ${e.message}`);
            }
        });

        if (parsed.length === 0) {
          setErrorMsg('');
        }
        setRegistros(parsed);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 50); // small delay to allow UI to show active state if needed
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      setErrorMsg('Formato inválido. Por favor, selecione apenas arquivos .txt ou .csv');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setInputRaw(e.target?.result);
        setErrorMsg('');
        // Automatic processing when file is loaded? Sure.
        // We defer it slightly to let state update
      }
    };
    reader.readAsText(file, 'latin1');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans w-full max-w-7xl mx-auto"
    >
      <div className="w-full mb-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-solides-roxo transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Hub
        </button>
        
        <div className="flex items-center gap-3">
            <label htmlFor="sistema-select" className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Layout de Destino:</label>
            <select 
              id="sistema-select" 
              value={sistema}
              onChange={(e) => {
                  setSistema(e.target.value as LayoutId);
                  if(inputRaw) {
                      // Need a slight delay to let state update or use useEffect
                  }
              }}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-solides-roxo focus:border-solides-roxo block p-2.5 outline-none cursor-pointer hover:border-solides-roxo/50 transition-all font-semibold shadow-sm"
            >
                <option value="dominio">Domínio Sistemas</option>
                <option value="alterdata">Alterdata</option>
                <option value="questor">Questor</option>
                <option value="contmatic">Contmatic Phoenix</option>
                <option value="sci_antigo">SCI - Layout Antigo</option>
                <option value="sci_novo">SCI - Layout Novo</option>
            </select>
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-8">
        <div className="bg-[#FFBA00]/10 border-b border-[#FFBA00]/30 px-6 py-4 flex items-start sm:items-center gap-3">
          <AlertTriangle className="text-[#cc9500] w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-[#997000] font-medium">
            <strong className="font-bold">Uso Interno:</strong> Esta ferramenta é exclusiva para colaboradores e não deve ser compartilhada com clientes.
          </p>
        </div>

        <div className="h-2 w-full bg-gradient-to-r from-solides-roxo via-solides-dev to-solides-light" />

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-solides-blue/10 flex items-center justify-center border border-solides-blue/20 shadow-sm flex-shrink-0">
              <span className="text-solides-blue font-bold text-3xl font-display">ó</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-solides-dark tracking-tight font-display">Leitor de Eventos de Folha</h1>
              <p className="text-slate-500 text-sm mt-1">Carregue arquivos posicionais ou delimitados para visualizar os eventos de folha formatados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-50/50 rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Fonte de Dados</label>
                        <span className="text-[10px] font-mono bg-solides-roxo/10 text-solides-roxo px-2 py-1 rounded-lg border border-solides-roxo/20 font-bold tracking-tighter">
                            {activeLayout.tipo === 'posicional' ? `${activeLayout.tamanhoLinha} chars` : `Delimitador: "${activeLayout.delimitador}"`}
                        </span>
                    </div>

                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                                // reuse logic from handleFile
                                const inputObj = { target: { files: [file] } } as unknown as ChangeEvent<HTMLInputElement>;
                                handleFile(inputObj);
                            }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 mb-4 text-center cursor-pointer flex flex-col items-center gap-3 transition-colors ${
                            isDragOver ? 'bg-solides-roxo/5 border-solides-roxo' : 'border-slate-300 hover:bg-slate-50 hover:border-solides-roxo/50'
                        }`}
                    >
                        <input type="file" ref={fileInputRef} accept=".txt,.csv" onChange={handleFile} className="hidden" />
                        <div className="p-3 bg-white rounded-full text-slate-400 shadow-sm">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-600">Anexar Arquivo .txt</p>
                            <p className="text-[10px] text-slate-400 tracking-tight">ou arraste o arquivo aqui</p>
                        </div>
                    </div>
                    
                    <textarea 
                        value={inputRaw}
                        onChange={(e) => setInputRaw(e.target.value)}
                        wrap="off" 
                        className="w-full h-64 bg-white border border-slate-200 rounded-2xl p-4 font-mono text-xs focus:ring-2 focus:ring-solides-roxo focus:border-solides-roxo outline-none transition-all resize-none shadow-sm overflow-x-auto whitespace-pre" 
                        placeholder="Ou cole as linhas do arquivo aqui..."
                    />
                    
                    <div className="flex flex-col gap-3 mt-6">
                        <button 
                            onClick={processarDados}
                            disabled={isProcessing || !inputRaw}
                            className="bg-solides-roxo text-white hover:bg-solides-dark font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                            Processar Dados
                        </button>
                        <button 
                            onClick={() => {
                                setInputRaw('');
                                setRegistros([]);
                                setErrorMsg('');
                                if(fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-500 font-semibold py-3 px-6 rounded-2xl transition-colors border border-slate-200 shadow-sm"
                        >
                            Limpar campos
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 flex-shrink-0" />
                        <span className="text-sm font-semibold">{errorMsg}</span>
                    </motion.div>
                )}

                {!errorMsg && registros.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <h2 className="font-bold text-slate-800 text-lg font-display">Eventos Detectados</h2>
                                <span className="text-[10px] bg-white px-3 py-1 rounded-full text-slate-500 font-bold border border-slate-200">
                                    {registros.length} registro(s)
                                </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                Layout: <span className="text-solides-roxo font-black">{activeLayout.nome}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-grow">
                            <table className="w-full text-left text-sm border-collapse min-w-max">
                                <thead>
                                    <tr className="bg-white text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                                        {activeLayout.campos.map((c, i) => (
                                            <th key={i} className={`p-4 ${c.class.includes('text-right') ? 'text-right' : 'text-left'}`}>
                                                {c.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {registros.map((reg, idx) => (
                                        <tr key={idx} className="hover:bg-solides-roxo/5 transition-colors group">
                                            {activeLayout.campos.map((c, i) => {
                                                const fmt = (c.formatType && formatadores[c.formatType]) ? formatadores[c.formatType] : formatadores.default;
                                                return (
                                                    <td key={i} className={`p-4 font-mono whitespace-nowrap text-sm ${c.class}`}>
                                                        {fmt(reg[c.nome])}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 text-center border-t border-slate-200 mt-auto">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Processamento efetuado localmente via navegador</p>
                        </div>
                    </motion.div>
                )}

                {!errorMsg && registros.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-sm border border-slate-100">
                            <Inbox className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-slate-500 font-bold text-lg font-display">Aguardando dados...</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Escolha o sistema no dropdown e anexe o arquivo .txt para gerar a tabela comparativa.</p>
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
