'use client';
import { useState } from 'react';

interface AHPBordaResult {
  ranking: number;
  nama_pokemon: string;
  borda_points: number[];
  nilai_akhir: number;
}

interface AlternativeInput {
  id: string;
  name: string;
  scores: number[];
}

export default function PokedexLandingPage() {
  const [results, setResults] = useState<AHPBordaResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const [alternatives, setAlternatives] = useState<AlternativeInput[]>([
    { id: 'A1', name: '', scores: [] },
    { id: 'A2', name: '', scores: [] },
    { id: 'A3', name: '', scores: [] },
  ]);

  const ahpWeights = [0.4009, 0.2459, 0.1664, 0.1278, 0.0589];

  const handleAddRow = () => {
    const newId = `A${alternatives.length + 1}`;
    setAlternatives([...alternatives, { id: newId, name: '', scores: [5, 5, 5, 5, 5] }]);
  };

  const handleDeleteRow = (indexToRemove: number) => {
    const updated = alternatives.filter((_, idx) => idx !== indexToRemove);
    updated.forEach((alt, idx) => { alt.id = `A${idx + 1}` });
    setAlternatives(updated);
  };

  const handleUpdate = (index: number, field: 'name' | 'scores', value: string | number, scoreIndex?: number) => {
    const updated = [...alternatives];
    if (field === 'name') {
      updated[index].name = value as string;
    } else if (field === 'scores' && scoreIndex !== undefined) {
      updated[index].scores[scoreIndex] = Number(value);
    }
    setAlternatives(updated);
  };

  const handleCalculate = async () => {
    if (alternatives.some(a => a.name.trim() === '')) {
      alert("Harap isi semua nama Pokémon sebelum melakukan pemindaian!");
      return;
    }
    if (alternatives.length < 2) {
      alert("Minimal harus ada 2 Pokémon di dalam database untuk dianalisis!");
      return;
    }

    setIsCalculating(true);
    setHasCalculated(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); 
      
      const res = await fetch('http://localhost:5000/api/ahp-borda/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alternatives })
      });
      
      const data = await res.json();
      if (res.ok) {
        setResults(data.data);
        setHasCalculated(true);
      } else {
        alert(data.message || "Sistem Pokédex mengalami gangguan.");
      }
    } catch (err) {
      console.error(err);
      alert("Koneksi ke server pusat (Flask) terputus.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-8 font-sans">
      
      <div className="max-w-6xl w-full bg-red-600 rounded-[2rem] shadow-2xl border-[12px] border-red-800 overflow-hidden relative">
        
        <div className="bg-red-700 px-6 py-4 flex items-start gap-4 border-b-8 border-red-900 shadow-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-300">
            <div className="w-14 h-14 bg-cyan-400 rounded-full border-4 border-cyan-200 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] animate-pulse"></div>
          </div>
          <div className="flex gap-2 pt-2">
            <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-red-900 shadow-[inset_0_0_5px_rgba(255,255,255,0.8)]"></div>
            <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-700 shadow-[inset_0_0_5px_rgba(255,255,255,0.8)]"></div>
            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-green-800 shadow-[inset_0_0_5px_rgba(255,255,255,0.8)]"></div>
          </div>
          
          <div className="ml-auto text-right mt-2 hidden md:block">
            <h1 className="text-3xl font-black text-white drop-shadow-md italic tracking-wider uppercase">Pokédex</h1>
            <p className="text-red-200 text-sm font-bold tracking-widest">AHP & BORDA SYSTEM</p>
          </div>
        </div>

        <div className="bg-gray-200 m-4 md:m-8 rounded-xl border-[12px] border-gray-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] p-1">
          <div className="bg-slate-50 rounded-lg p-4 md:p-6 min-h-[500px]">
            
            <div className="mb-8">
              <div className="flex justify-between items-end mb-4 border-b-4 border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-blue-500">▶</span> Input Nilai Alternatif
                </h2>
                <button 
                  onClick={handleAddRow}
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 py-2 px-5 rounded-full font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  + Tambah Entri
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-lg mb-6 border-2 border-slate-200">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-800 text-cyan-400">
                    <tr>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs">ID</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs">Nama</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Atk (C1)</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">HP (C2)</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Skill (C3)</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Def (C4)</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Evo (C5)</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-xs text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {alternatives.map((alt, idx) => (
                      <tr key={idx} className="hover:bg-cyan-50 transition-colors">
                        <td className="p-4 font-black text-slate-400">{alt.id}</td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={alt.name} 
                            onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                            placeholder="Nama Pokémon"
                            className="w-full p-2 border-2 border-slate-200 rounded-md focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none font-bold text-slate-700 uppercase"
                          />
                        </td>
                        {[0, 1, 2, 3, 4].map((scoreIdx) => (
                          <td key={scoreIdx} className="p-2">
                            <select 
                              value={alt.scores[scoreIdx]}
                              onChange={(e) => handleUpdate(idx, 'scores', e.target.value, scoreIdx)}
                              className="w-full p-2 border-2 border-slate-200 rounded-md bg-white focus:border-cyan-400 outline-none cursor-pointer text-slate-700 font-bold text-center appearance-none"
                            >
                              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <button 
                            onClick={() => handleDeleteRow(idx)}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold transition-colors"
                            title="Hapus Entri"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className={`relative flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-white text-lg uppercase tracking-widest transition-all shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-2
                    ${isCalculating ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400'}`}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memindai Data...
                    </>
                  ) : (
                    '🔍 Analisis Kompetitif'
                  )}
                </button>
              </div>
            </div>

            {hasCalculated && (
              <div className="mt-8 border-t-4 border-slate-200 pt-8 animate-[fadeInUp_0.5s_ease-out]">
                <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-green-500">▶</span> Hasil Peringkat Borda Terbobot
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  
                  <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800 text-cyan-400">
                        <tr>
                          <th className="p-4 font-bold uppercase tracking-wider text-xs">Rank</th>
                          <th className="p-4 font-bold uppercase tracking-wider text-xs">Spesies</th>
                          <th className="p-4 font-bold uppercase tracking-wider text-xs text-center hidden lg:table-cell">Poin Borda</th>
                          <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Total Skor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.map((item, index) => (
                          <tr key={index} className={`transition-colors ${index === 0 ? 'bg-yellow-50' : ''}`}>
                            <td className="p-4 font-black text-slate-800 flex items-center gap-2">
                              #{item.ranking} {index === 0 && <span className="text-xl">👑</span>}
                            </td>
                            <td className={`p-4 font-black uppercase ${index === 0 ? 'text-red-600' : 'text-slate-700'}`}>
                              {item.nama_pokemon}
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-400 text-center text-xs tracking-widest hidden lg:table-cell">
                              [{item.borda_points.join(', ')}]
                            </td>
                            <td className="p-4 font-mono font-black text-slate-800 text-right text-lg">
                              {item.nilai_akhir.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-6 shadow-inner border-4 border-slate-700 flex flex-col justify-center gap-6">
                    {results.map((item, index) => {
                      const percentage = (item.nilai_akhir / results[0].nilai_akhir) * 100;
                      return (
                        <div key={index} className="w-full">
                          <div className="flex justify-between text-sm font-black mb-2 uppercase tracking-wide">
                            <span className={index === 0 ? 'text-yellow-400' : 'text-cyan-400'}>{item.nama_pokemon}</span>
                            <span className="text-slate-300 font-mono">{item.nilai_akhir.toFixed(4)}</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-600">
                            <div 
                              className={`h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden
                                ${index === 0 ? 'bg-yellow-400' : 'bg-cyan-500'}`}
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-25" style={{ transform: 'skewX(-45deg) translateX(-50%)' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900 border-4 border-slate-800 rounded-xl p-4 md:p-6 shadow-inner">
                  <h3 className="text-cyan-400 font-mono font-bold text-sm mb-4 uppercase flex items-center gap-2 border-b border-slate-700 pb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Logika Komputasi (Debug Console)
                  </h3>
                  
                  <div className="text-slate-300 font-mono text-xs md:text-sm space-y-4">
                    <div>
                      <span className="text-yellow-400 font-bold">1. VALIDASI BOBOT KRITERIA (AHP)</span>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2 bg-slate-800 p-3 rounded border border-slate-700">
                        <div><span className="text-cyan-300">C1 (Atk):</span> {ahpWeights[0]}</div>
                        <div><span className="text-cyan-300">C2 (HP):</span> {ahpWeights[1]}</div>
                        <div><span className="text-cyan-300">C3 (Skl):</span> {ahpWeights[2]}</div>
                        <div><span className="text-cyan-300">C4 (Def):</span> {ahpWeights[3]}</div>
                        <div><span className="text-cyan-300">C5 (Evo):</span> {ahpWeights[4]}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-yellow-400 font-bold">2. PERHITUNGAN SKOR AKHIR (WEIGHTED BORDA)</span>
                      <div className="mt-2 space-y-3 bg-slate-800 p-3 rounded border border-slate-700 overflow-x-auto">
                        {results.map((item) => (
                          <div key={item.nama_pokemon} className="whitespace-nowrap">
                            <span className="text-white font-bold w-24 inline-block">{item.nama_pokemon}</span> = 
                            <span className="text-slate-400 ml-2">
                              ({item.borda_points[0]} × {ahpWeights[0]}) + 
                              ({item.borda_points[1]} × {ahpWeights[1]}) + 
                              ({item.borda_points[2]} × {ahpWeights[2]}) + 
                              ({item.borda_points[3]} × {ahpWeights[3]}) + 
                              ({item.borda_points[4]} × {ahpWeights[4]})
                            </span>
                            <span className="text-cyan-400 font-bold ml-2">
                              = {item.nilai_akhir.toFixed(4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
        
        <div className="px-10 py-6 flex gap-4">
          <div className="w-16 h-4 bg-slate-900 rounded-full opacity-50 shadow-inner"></div>
          <div className="w-16 h-4 bg-slate-900 rounded-full opacity-50 shadow-inner"></div>
        </div>

      </div>
    </div>
  );
}