import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReactOfficial from 'highcharts-react-official';
const HighchartsReact = HighchartsReactOfficial.default ?? HighchartsReactOfficial;
import { fetchRecords, createRecord, deleteRecord } from './api';

// Risk skoru rengini belirle
const getRiskStyle = (risk) => {
  if (!risk) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  if (risk.startsWith('Düşük')) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (risk.startsWith('Orta')) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
};

function App() {
  const [records, setRecords] = useState([]);
  const [age, setAge] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [sugarLevel, setSugarLevel] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecords();
      setRecords(data);
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Django sunucusunun çalıştığından emin olun (port 8000).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!age || !bloodPressure || !sugarLevel) return;
    try {
      setSubmitting(true);
      setError(null);
      await createRecord({ age: Number(age), blood_pressure: bloodPressure, sugar_level: Number(sugarLevel) });
      setAge(''); setBloodPressure(''); setSugarLevel('');
      loadRecords();
    } catch (err) {
      setError('Kayıt eklenirken hata oluştu. Girdiğiniz değerleri kontrol edin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecord(id);
      loadRecords();
    } catch {
      setError('Kayıt silinirken hata oluştu.');
    }
  };

  // Highcharts – Şeker Seviyesi Değişim Grafiği
  const chartData = [...records]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(r => ({
      x: new Date(r.created_at).getTime(),
      y: r.sugar_level,
      name: `Yaş: ${r.age} | Tansiyon: ${r.blood_pressure}`,
    }));

  const chartOptions = {
    chart: { type: 'areaspline', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
    title: { text: 'Şeker Seviyesi Değişimi', style: { color: '#1e293b', fontWeight: '700', fontSize: '16px' } },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#64748b' } },
      lineColor: '#e2e8f0',
      tickColor: '#e2e8f0',
    },
    yAxis: {
      title: { text: 'Şeker Seviyesi (mg/dL)', style: { color: '#64748b' } },
      labels: { style: { color: '#64748b' } },
      gridLineColor: '#f1f5f9',
      plotLines: [
        { value: 70, color: '#f59e0b', dashStyle: 'dash', width: 1, label: { text: 'Alt Sınır (70)', style: { color: '#f59e0b' } } },
        { value: 140, color: '#f59e0b', dashStyle: 'dash', width: 1, label: { text: 'Üst Sınır (140)', style: { color: '#f59e0b' } } },
        { value: 200, color: '#ef4444', dashStyle: 'dash', width: 1, label: { text: 'Yüksek Risk (200)', style: { color: '#ef4444' } } },
      ],
    },
    tooltip: {
      formatter: function () {
        return `<b>${this.point.name}</b><br/>Tarih: ${Highcharts.dateFormat('%d/%m/%Y %H:%M', this.x)}<br/>Şeker: <b>${this.y} mg/dL</b>`;
      },
    },
    series: [{
      name: 'Şeker Seviyesi',
      data: chartData,
      color: '#6366f1',
      fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(99,102,241,0.3)'], [1, 'rgba(99,102,241,0)']] },
      marker: { enabled: true, radius: 5, fillColor: '#6366f1', lineWidth: 2, lineColor: '#fff' },
    }],
    legend: { enabled: false },
    credits: { enabled: false },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <span>🏥</span> BULUT TABANLI SAĞLIK YÖNETİMİ
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Sağlık <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Analiz</span> Sistemi
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Hasta verilerinizi kaydedin, anlık risk analizini görüntüleyin.</p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Kayıt Formu */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📋</span> Yeni Ölçüm Ekle
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Yaş <span className="text-red-400">*</span></label>
              <input
                type="number" value={age} onChange={e => setAge(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 transition"
                placeholder="Örn: 45" required min="1" max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Tansiyon <span className="text-red-400">*</span></label>
              <input
                type="text" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 transition"
                placeholder="Örn: 12.8" required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Şeker Seviyesi (mg/dL) <span className="text-red-400">*</span></label>
              <input
                type="number" value={sugarLevel} onChange={e => setSugarLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 transition"
                placeholder="Örn: 95" required step="0.1"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit" disabled={submitting}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 disabled:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {submitting ? 'Kaydediliyor...' : '📤 Ölçümü Kaydet & Analiz Et'}
              </button>
            </div>
          </form>
        </div>

        {/* Highcharts Grafik */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>

        {/* Kayıtlar Listesi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">📁 Kayıtlar</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">{records.length} Kayıt</span>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              <p className="mt-3 text-slate-400 font-medium">Veriler yükleniyor...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-3xl mb-2">🩺</p>
              <p className="text-slate-500 font-medium">Henüz ölçüm eklenmedi.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {records.map(record => {
                const risk = getRiskStyle(record.risk_score);
                return (
                  <div key={record.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">{new Date(record.created_at).toLocaleString('tr-TR')}</p>
                        <p className="text-slate-700 font-semibold mt-1">Yaş: <span className="text-indigo-600">{record.age}</span></p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${risk.bg} ${risk.text} ${risk.border}`}>
                        {record.risk_score || 'Hesaplanıyor...'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs">Tansiyon</p>
                        <p className="text-slate-800 font-bold text-lg">{record.blood_pressure}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs">Şeker (mg/dL)</p>
                        <p className="text-slate-800 font-bold text-lg">{record.sugar_level}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="self-end text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                    >
                      🗑 Kaydı Sil
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
