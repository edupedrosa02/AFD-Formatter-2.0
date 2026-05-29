import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Wand2, 
  AlertTriangle, 
  CheckCircle2,
  LayoutList,
  FileSignature,
  ArrowLeft
} from 'lucide-react';

interface Marcacao {
  nsr: string;
  tipo: string;
  dataHora: string;
  cpfPis: string;
  linhaOriginal: string;
}

export default function FormatadorAFD({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'formatador' | 'visualizador'>('formatador');

  function parseMarcacoes(texto: string): Marcacao[] {
    const linhas = texto.split(/\r?\n/);
    const marcacoes: Marcacao[] = [];

    for (const linha of linhas) {
      if (linha.length >= 34) {
        const tipo = linha.substring(9, 10);
        if (tipo === '3' || tipo === '7') {
          const nsr = parseInt(linha.substring(0, 9), 10).toString(); // remove leading zeros
          
          let dataHora = '';
          let cpfPis = '';

          // Verifica se o formato de data contém o padrão de ano (ex: 2026-05-14T...)
          if (linha.substring(10, 20).includes('-')) {
             const dataHoraOriginal = linha.substring(10, 34);
             dataHora = dataHoraOriginal;
             try {
                 if(dataHoraOriginal.length >= 19) {
                     const data = dataHoraOriginal.substring(0,10).split('-').reverse().join('/');
                     const hora = dataHoraOriginal.substring(11,19);
                     dataHora = `${data} às ${hora}`;
                 }
             } catch(e) {}
             cpfPis = linha.substring(34, 46).trim();
          } else {
             // Formato Antigo Portaria 1510
             const dataOriginal = linha.substring(10, 18);
             const horaOriginal = linha.substring(18, 22);
             
             if (dataOriginal.length === 8 && horaOriginal.length === 4) {
                const dia = dataOriginal.substring(0, 2);
                const mes = dataOriginal.substring(2, 4);
                const ano = dataOriginal.substring(4, 8);
                const hora = horaOriginal.substring(0, 2);
                const min = horaOriginal.substring(2, 4);
                dataHora = `${dia}/${mes}/${ano} às ${hora}:${min}`;
             }
             cpfPis = linha.substring(22, 34).trim();
          }

          if (cpfPis.length === 12 && cpfPis.startsWith('0')) {
            cpfPis = cpfPis.substring(1);
          }
          if (cpfPis.length === 11) {
            cpfPis = cpfPis.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
          }
          
          marcacoes.push({ 
            nsr, 
            tipo: tipo === '3' ? 'Rep C/A (3)' : 'Rep P (7)', 
            dataHora, 
            cpfPis, 
            linhaOriginal: linha 
          });
        }
      }
    }
    return marcacoes;
  }

  const marcacoes = parseMarcacoes(output || input);

  function carregarArquivo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.name.endsWith('.txt')) {
      alert('Por favor, selecione um arquivo .txt válido.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setInput(e.target.result);
        setOutput('');
      }
    };

    reader.readAsText(arquivo, 'latin1');
  }

  function formatarAFD() {
    if (!input.trim()) {
      alert('Nenhum dado para formatar. Por favor, cole o texto ou faça upload de um arquivo.');
      return;
    }

    const linhas = input.split(/\r?\n/);

    const linhasFormatadas = linhas.map((linha) => {
      if (!linha.trim()) return '';
      let novaLinha = linha;
      novaLinha = novaLinha.replace(/(T\d{2}:\d{2}:\d{2}[+-]\d{4})(?!\d)/g, '$10');
      novaLinha = novaLinha.replace(/\s+([0-9A-Fa-f]{4})\s*$/, '$1');
      if (!novaLinha.endsWith('000000000')) {
        novaLinha += '000000000';
      }
      return novaLinha;
    });

    setOutput(linhasFormatadas.join('\n'));
  }

  function limparTudo() {
    setInput('');
    setOutput('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function baixarArquivo() {
    if (!output.trim()) {
      alert('Não há conteúdo formatado para download. Formate o arquivo primeiro.');
      return;
    }

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AFD_formatado.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMostrarModal(true);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans w-full"
    >
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-solides-roxo transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Hub
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-[#FFBA00]/10 border-b border-[#FFBA00]/30 px-6 py-4 flex items-start sm:items-center gap-3">
          <AlertTriangle className="text-[#cc9500] w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-[#997000] font-medium">
            <strong className="font-bold">Uso Interno:</strong> Esta ferramenta é exclusiva para colaboradores e não deve ser compartilhada com clientes.
          </p>
        </div>

        <div className="h-2 w-full bg-gradient-to-r from-solides-roxo via-solides-dev to-solides-light" />

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-solides-roxo/10 flex items-center justify-center border border-solides-roxo/20 shadow-sm flex-shrink-0">
              <FileText className="text-solides-roxo w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-solides-dark tracking-tight font-display">Formatador de AFD</h1>
              <p className="text-slate-500 text-sm mt-1">Padronização e visualização de arquivos de Fonte de Dados Sólides.</p>
            </div>
          </div>

          <div className="flex space-x-6 border-b border-slate-200 mb-8 font-display">
            <button
              onClick={() => setActiveTab('formatador')}
              className={`flex items-center gap-2 px-1 py-4 text-base font-semibold border-b-2 transition-colors ${
                activeTab === 'formatador'
                  ? 'border-solides-roxo text-solides-roxo'
                  : 'border-transparent text-slate-500 hover:text-solides-dark hover:border-slate-300'
              }`}
            >
              <FileSignature className="w-5 h-5" />
              Formatador
            </button>
            <button
              onClick={() => setActiveTab('visualizador')}
              className={`flex items-center gap-2 px-1 py-4 text-base font-semibold border-b-2 transition-colors ${
                activeTab === 'visualizador'
                  ? 'border-solides-roxo text-solides-roxo'
                  : 'border-transparent text-slate-500 hover:text-solides-dark hover:border-slate-300'
              }`}
            >
              <LayoutList className="w-5 h-5" />
              Visualizador de Marcações
            </button>
          </div>

          {activeTab === 'formatador' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3" htmlFor="file-upload">
                  Importar arquivo AFD original (.txt)
                </label>
                <div className="relative group">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    ref={fileInputRef}
                    onChange={carregarArquivo}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-solides-roxo/5 group-hover:border-solides-roxo/30 transition-all duration-200 ease-in-out">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-solides-roxo" />
                    </div>
                    <p className="text-base text-slate-600 font-medium group-hover:text-solides-dark">
                      Clique ou arraste o arquivo <span className="font-bold text-solides-roxo">.txt</span> aqui
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Sua importação substituirá o texto abaixo.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-end">
                    <span>Conteúdo Original</span>
                    <span className="text-xs font-normal text-slate-400">Edição manual permitida</span>
                  </label>
                  <textarea
                    rows={14}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full flex-grow rounded-xl border border-slate-200 p-4 text-sm font-mono text-slate-800 bg-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-solides-roxo/50 focus:border-solides-roxo transition-all shadow-sm resize-none"
                    placeholder="Cole o conteúdo do arquivo AFD aqui, ou faça o upload acima..."
                    spellCheck={false}
                  />
                </div>

                <div className="flex flex-col h-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-end">
                    <span>Resultado Formatado</span>
                    <span className="text-xs font-normal text-slate-400">Apenas leitura</span>
                  </label>
                  <textarea
                    rows={14}
                    value={output}
                    readOnly
                    className="w-full flex-grow rounded-xl border border-slate-200 p-4 text-sm font-mono text-slate-600 bg-slate-50 focus:outline-none shadow-sm resize-none"
                    placeholder="O resultado formatado aparecerá aqui após o processamento."
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={limparTudo}
                  className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 hover:text-solides-red text-slate-600 text-sm font-semibold px-6 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </button>

                <button
                  onClick={formatarAFD}
                  disabled={!input.trim()}
                  className="flex items-center gap-2 bg-solides-roxo/10 hover:bg-solides-roxo/20 text-solides-dark border border-solides-roxo/20 text-sm font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-solides-roxo/30"
                >
                  <Wand2 className="w-4 h-4 text-solides-roxo" />
                  Formatar AFD
                </button>

                <button
                  onClick={baixarArquivo}
                  disabled={!output.trim()}
                  className="flex items-center gap-2 bg-solides-roxo hover:bg-solides-dark text-white text-sm font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-solides-roxo focus:ring-offset-2"
                >
                  <Download className="w-5 h-5" />
                  Baixar TXT
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'visualizador' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-200 p-6 rounded-xl shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-solides-roxo/10 flex items-center justify-center flex-shrink-0">
                    <LayoutList className="w-6 h-6 text-solides-roxo" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-solides-dark font-display">Arquivo de Visualização</h3>
                    <p className="text-sm text-slate-500">Faça o upload direto de um AFD já formatado (ou original).</p>
                  </div>
                </div>
                <div className="relative w-full sm:w-auto mt-2 sm:mt-0">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => {
                      carregarArquivo(e);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-50 border border-slate-300 hover:bg-slate-100 text-solides-dark text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-solides-roxo focus:ring-offset-2">
                    <Upload className="w-4 h-4" />
                    Carregar .txt
                  </button>
                </div>
              </div>

              {marcacoes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <LayoutList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Nenhuma marcação de ponto encontrada.</p>
                  <p className="text-sm text-slate-400 mt-1">Carregue um arquivo AFD acima para visualizar os registros do tipo 3 ou 7.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-[600px] overflow-y-auto w-full">
                  <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[600px]">
                    <thead className="bg-slate-50 text-solides-dark font-display font-bold border-b border-slate-200 sticky top-0 z-10 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">NSR</th>
                        <th className="px-6 py-4">Data e Hora</th>
                        <th className="px-6 py-4">Colaborador (CPF/PIS)</th>
                        <th className="px-6 py-4">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {marcacoes.map((m, i) => (
                        <tr key={i} className="hover:bg-solides-roxo/5 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{m.nsr}</td>
                          <td className="px-6 py-4">{m.dataHora}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{m.cpfPis}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${m.tipo.includes('3') ? 'bg-solides-green/10 text-solides-green border-solides-green/20' : 'bg-solides-blue/10 text-solides-blue border-solides-blue/20'}`}>
                              {m.tipo}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-solides-roxo" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-solides-roxo/10 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-solides-roxo" />
                </div>
                
                <h2 className="text-2xl font-bold text-solides-dark mb-2 font-display">
                  Arquivo Gerado!
                </h2>
                
                <p className="text-sm text-slate-500 mb-8">
                  Seu arquivo AFD foi formatado com sucesso e o download foi iniciado. Ele já está pronto para importação.
                </p>

                <button
                  onClick={() => setMostrarModal(false)}
                  className="w-full bg-solides-roxo hover:bg-solides-dark text-white text-base font-semibold py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-solides-roxo focus:ring-offset-2"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
