import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReactOfficial from 'highcharts-react-official';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const HighchartsReact = HighchartsReactOfficial.default ?? HighchartsReactOfficial;
import { fetchRecords, createRecord, deleteRecord, login as apiLogin } from './api';

const getRiskStyle = (risk) => {
  if (!risk) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  const r = risk.toLowerCase();
  if (r.includes('düşük')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
  if (r.includes('orta')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
  return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' };
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [records, setRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('ALL'); // 'ALL' or 'Patient Name'
  
  const [form, setForm] = useState({
    patient_name: '', age: '', height: '175', weight: '75', 
    blood_pressure: '', sugar_level: '', is_smoking: 'NO', activity_level: 'MEDIUM'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchRecords();
      setRecords(data);
    } catch { setError('Bağlantı hatası.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadRecords(); }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = await apiLogin(username, password);
      setToken(data.access);
    } catch { setError('Giriş başarısız.'); }
    finally { setSubmitting(false); }
  };

  const handleLogout = () => {
    setToken(null); localStorage.removeItem('token'); setRecords([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createRecord({
        ...form, age: Number(form.age), height: Number(form.height), 
        weight: Number(form.weight), sugar_level: Number(form.sugar_level)
      });
      // Kayıt ekledikten sonra o hastayı otomatik seçelim
      setSelectedPatient(form.patient_name);
      setForm({ ...form, patient_name: '', blood_pressure: '', sugar_level: '' });
      loadRecords();
    } catch { setError('İşlem başarısız.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Veriyi silmek istiyor musunuz?')) {
      await deleteRecord(id); loadRecords();
    }
  };

  // Mevcut benzersiz hasta isimlerini al
  const patients = ['ALL', ...new Set(records.map(r => r.patient_name))];

  // Aktif filtrelenmiş veriler (Seçili hastaya göre)
  const displayRecords = selectedPatient === 'ALL' 
    ? records 
    : records.filter(r => r.patient_name === selectedPatient);

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text('HASTA SAGLIK ANALIZ RAPORU', 14, 20);
      doc.setFontSize(10);
      doc.text(`Kapsam: ${selectedPatient === 'ALL' ? 'Genel Rapor' : selectedPatient}`, 14, 28);
      
      const tableData = displayRecords.map(r => [
        r.patient_name,
        new Date(r.created_at).toLocaleDateString(),
        r.bmi,
        r.risk_score
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Hasta', 'Tarih', 'VKE', 'Risk Durumu']],
        body: tableData,
        theme: 'grid'
      });
      doc.save(`Analiz_${selectedPatient}.pdf`);
    } catch (e) { alert("PDF hatası!"); }
  };

  // AI Tavsiyesi (Seçili hastaya özel)
  const getPersonalizedTip = () => {
    if (!displayRecords.length) return "Veri girişi bekleniyor...";
    const latest = displayRecords[0];
    if (latest.risk_score?.includes('Kritik')) return `🚨 DİKKAT: ${latest.patient_name}, risk seviyeniz kritik. Lütfen ölçümlerinizi sıklaştırın.`;
    if (latest.bmi > 25) return `⚖️ TAVSİYE: ${latest.patient_name}, VKE değeriniz yüksek. Fiziksel aktiviteyi artırabilirsiniz.`;
    return `✅ TEBRİKLER: ${latest.patient_name}, mevcut verileriniz sağlıklı sınırda görünüyor.`;
  };

  const stats = {
    avgSugar: displayRecords.length ? Math.round(displayRecords.reduce((a, b) => a + (b.sugar_level || 0), 0) / displayRecords.length) : 0,
    latestBMI: displayRecords.length ? (displayRecords[0].bmi || 0) : 0,
    totalRecords: displayRecords.length
  };

  const chartOptions = {
    chart: { type: 'spline', backgroundColor: 'transparent' },
    title: { text: null },
    xAxis: { type: 'datetime' },
    yAxis: { title: { text: null }, gridLineColor: '#f1f5f9' },
    series: [
      { name: 'Şeker', data: displayRecords.map(r => [new Date(r.created_at).getTime(), r.sugar_level]), color: '#6366f1' },
      { name: 'BMI', data: displayRecords.map(r => [new Date(r.created_at).getTime(), r.bmi]), color: '#10b981' }
    ],
    credits: { enabled: false }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-[3rem] shadow-2xl p-10 border border-slate-800">
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl">🛡️</div>
              <h1 className="text-3xl font-black text-white">Sistem Girişi</h1>
           </div>
           <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Admin" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 active:scale-95 mt-4 text-sm tracking-widest uppercase">Oturumu Başlat</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 font-sans pb-20">
      
      {/* Upper Navigation Patient Selector */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-black">H</div>
              <h2 className="text-lg font-black tracking-tight">Klinik <span className="text-indigo-600">Yönetim Takibi</span></h2>
           </div>
           <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto no-scrollbar">
              {patients.map(p => (
                <button key={p} onClick={() => setSelectedPatient(p)} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all duration-300 whitespace-nowrap ${selectedPatient === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                   {p === 'ALL' ? '📊 TÜM HASTALAR' : `👤 ${p.toUpperCase()}`}
                </button>
              ))}
           </div>
           <div className="flex items-center gap-4">
              <button onClick={exportPDF} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100">DÖKÜM AL</button>
              <button onClick={handleLogout} className="text-[10px] font-black text-rose-500">ÇIKIŞ</button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Dynamic Patient Insight */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-black">{selectedPatient === 'ALL' ? 'Panoramik Görünüm' : `Analiz: ${selectedPatient}`}</h3>
                <p className="text-indigo-100 opacity-90 mt-1 font-medium">{getPersonalizedTip()}</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 text-center">
                    <p className="text-[8px] font-black uppercase opacity-60">Ort. Şeker</p>
                    <p className="text-2xl font-black">{stats.avgSugar}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 text-center">
                    <p className="text-[8px] font-black uppercase opacity-60">Son BMI</p>
                    <p className="text-2xl font-black">{stats.latestBMI}</p>
                 </div>
              </div>
           </div>
           <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Entry Form */}
           <div className="lg:col-span-4">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                 <h2 className="text-xl font-black text-slate-800 mb-8">Klinik Veri Girişi</h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" required placeholder="Hasta Adı" value={form.patient_name} onChange={e => setForm({...form, patient_name: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" required placeholder="Yaş" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                       <input type="text" required placeholder="Tansiyon" value={form.blood_pressure} onChange={e => setForm({...form, blood_pressure: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" required placeholder="Boy" value={form.height} onChange={e => setForm({...form, height: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                       <input type="number" required placeholder="Kilo" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                    </div>
                    <input type="number" required placeholder="Şeker Seviyesi" value={form.sugar_level} onChange={e => setForm({...form, sugar_level: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                       <select value={form.is_smoking} onChange={e => setForm({...form, is_smoking: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none outline-none font-bold text-xs appearance-none">
                          <option value="NO">Sigara: Hayır</option>
                          <option value="YES">Sigara: Evet</option>
                       </select>
                       <select value={form.activity_level} onChange={e => setForm({...form, activity_level: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-none outline-none font-bold text-xs appearance-none">
                          <option value="LOW">Akt: Düşük</option>
                          <option value="MEDIUM">Akt: Orta</option>
                          <option value="HIGH">Akt: Yüksek</option>
                       </select>
                    </div>
                    <button disabled={submitting} className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/10 mt-6 tracking-widest text-xs uppercase">Anlık Analizi Başlat</button>
                 </form>
              </div>
           </div>

           {/* Metrics and Table Area */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                 <h2 className="text-xl font-black mb-8">Sağlık Trendi <span className="text-indigo-600">({selectedPatient === 'ALL' ? 'Tüm Havuz' : selectedPatient})</span></h2>
                 <HighchartsReact highcharts={Highcharts} options={chartOptions} />
              </div>

              <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                 <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Arşiv Kayıtları</h3>
                    <span className="text-[10px] font-black text-indigo-600 tracking-tighter">{displayRecords.length} KAYIT</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <tbody className="divide-y divide-slate-50">
                          {displayRecords.map(r => (
                            <tr key={r.id} className="group hover:bg-slate-50/50 transition duration-300">
                               <td className="px-8 py-6">
                                  <p className="text-sm font-black text-slate-800">{r.patient_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{new Date(r.created_at).toLocaleDateString('tr-TR')}</p>
                               </td>
                               <td className="px-8 py-6 text-sm font-black text-slate-700">{r.bmi} BMI</td>
                               <td className="px-8 py-6">
                                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black border text-center ${getRiskStyle(r.risk_score).bg} ${getRiskStyle(r.risk_score).text} ${getRiskStyle(r.risk_score).border}`}>
                                     {r.risk_score?.toUpperCase()}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-rose-50 text-rose-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">🗑</button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}

export default App;
