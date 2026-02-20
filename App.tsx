
import React, { useState, useMemo, useRef } from 'react';
import { Transaction, TransactionType } from './types';
import { Dashboard } from './components/Dashboard';
import { SettlementReport } from './components/SettlementReport';
import { getFinancialInsights } from './services/gemini';

const INITIAL_DATA: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Initial Deposit / رصيد أول المدة', amount: 20000, billNumber: 'DEP-001', category: 'Deposit', type: 'Deposit' },
  { id: '2', date: '2023-10-05', description: 'Mindmapp fees / رسوم مايند ماب', amount: 1500, billNumber: 'INV-102', category: 'Fees', type: 'Expense' },
  { id: '3', date: '2023-10-10', description: 'Internet bill / فاتورة إنترنت', amount: 650, billNumber: 'TEL-55', category: 'Internet', type: 'Expense' },
];

const CATEGORIES = ['Internet', 'Fees', 'Personal', 'Supplies', 'Transport', 'Utilities', 'Maintenance', 'Deposit'];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    billNumber: '',
    category: 'Personal',
    type: 'Expense' as TransactionType,
    invoiceImage: '' as string | undefined
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = useMemo(() => {
    const totalBudget = transactions.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalBudget,
      totalExpenses,
      balance: totalBudget - totalExpenses,
      count: transactions.length
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large (>2MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, invoiceImage: reader.result as string }));
        showToast('Invoice Captured / تم التقاط الفاتورة');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      showToast('Fill required fields / أكمل البيانات', 'error');
      return;
    }
    const amountNum = parseFloat(formData.amount);
    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, ...formData, amount: amountNum } : t));
      setEditingId(null);
      showToast('Record Updated / تم التحديث');
    } else {
      const newTransaction: Transaction = { id: Date.now().toString(), ...formData, amount: amountNum };
      setTransactions(prev => [newTransaction, ...prev]);
      showToast('Added Successfully / تم الحفظ بنجاح');
    }
    setFormData({ date: new Date().toISOString().split('T')[0], description: '', amount: '', billNumber: '', category: 'Personal', type: 'Expense', invoiceImage: '' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTransactions(prev => prev.filter(t => t.id !== id));
    setConfirmDeleteId(null);
    if (editingId === id) setEditingId(null);
    showToast('Deleted / تم الحذف');
  };

  const handleEdit = (t: Transaction, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(t.id);
    // Explicitly mapping properties to avoid mismatch with Transaction type (optional invoiceImage and extra id field)
    setFormData({
      date: t.date,
      description: t.description,
      amount: t.amount.toString(),
      billNumber: t.billNumber,
      category: t.category,
      type: t.type,
      invoiceImage: t.invoiceImage || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateAI = async () => {
    setIsAiLoading(true);
    try {
      const result = await getFinancialInsights(transactions);
      setAiInsights(result || "No insights generated.");
    } catch (err) {
      showToast('AI analysis failed', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} transactions={transactions} />;
      case 'reports':
        return <SettlementReport transactions={transactions} />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Column */}
            <div className="lg:col-span-4">
              <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-500 shadow-2xl sticky top-10 ${editingId ? 'bg-amber-50 border-amber-300 ring-[15px] ring-amber-100' : 'bg-white border-transparent'}`}>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8">
                  {editingId ? 'Modify Record / تعديل' : 'New Transaction / إضافة'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-[1.5rem]">
                    <button type="button" onClick={() => setFormData({...formData, type: 'Expense'})} className={`py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${formData.type === 'Expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>EXPENSE</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'Deposit'})} className={`py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${formData.type === 'Deposit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>DEPOSIT</button>
                  </div>
                  
                  <div className="relative group">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden relative ${formData.invoiceImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                       {formData.invoiceImage ? (
                         <>
                           <img src={formData.invoiceImage} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Receipt" />
                           <div className="relative z-10 text-center">
                              <i className="fas fa-check-circle text-2xl text-indigo-600 mb-2"></i>
                              <p className="text-[10px] font-black text-indigo-700 uppercase">Receipt Captured</p>
                           </div>
                         </>
                       ) : (
                         <div className="text-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-camera text-2xl text-slate-300 mb-2"></i>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach Invoice / إرفاق فاتورة</p>
                         </div>
                       )}
                    </button>
                    {formData.invoiceImage && (
                      <button type="button" onClick={() => setFormData({...formData, invoiceImage: ''})} className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><i className="fas fa-times"></i></button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description / البيان</label>
                    <input type="text" placeholder="Entry Details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Amount / المبلغ</label>
                      <input type="number" step="any" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-black text-slate-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ref #</label>
                      <input type="text" placeholder="Bill ID" value={formData.billNumber} onChange={e => setFormData({...formData, billNumber: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date / التاريخ</label>
                      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className={`w-full py-5 text-white rounded-[2rem] font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${editingId ? 'bg-amber-500' : 'bg-slate-900 hover:bg-black'}`}>
                    <i className={`fas ${editingId ? 'fa-sync-alt' : 'fa-save'} text-xl`}></i>
                    {editingId ? 'UPDATE RECORD' : 'SAVE TRANSACTION'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => {setEditingId(null); setFormData({date: new Date().toISOString().split('T')[0], description: '', amount: '', billNumber: '', category: 'Personal', type: 'Expense', invoiceImage: ''})}} className="w-full py-3 text-slate-400 text-xs font-black uppercase tracking-widest">Cancel Editing</button>
                  )}
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="relative group">
                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
                <input type="text" placeholder="Search archive..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-6 bg-white border-none rounded-[2rem] shadow-xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700" />
              </div>

              {/* Desktop View Table */}
              <div className="hidden md:block bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-50">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b-2 border-slate-50">
                    <tr>
                      <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction / البيان</th>
                      <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount / القيمة</th>
                      <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-50">
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className={`group hover:bg-indigo-50/30 transition-all ${editingId === t.id ? 'bg-amber-50' : ''}`}>
                        <td className="px-10 py-8">
                          <p className="text-lg font-black text-slate-800 leading-tight mb-1">{t.description}</p>
                          <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase">
                            <span className="flex items-center gap-1.5"><i className="far fa-calendar"></i> {t.date}</span>
                            <span className="flex items-center gap-1.5"><i className="fas fa-tag"></i> {t.category}</span>
                            <span className="flex items-center gap-1.5"><i className="fas fa-hashtag"></i> {t.billNumber}</span>
                          </div>
                        </td>
                        <td className={`px-10 py-8 text-right text-xl font-black ${t.type === 'Expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {t.type === 'Expense' ? '-' : '+'}{t.amount.toLocaleString()}
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex justify-center items-center gap-3">
                            {confirmDeleteId === t.id ? (
                               <div className="flex gap-2 animate-in zoom-in duration-200">
                                  <button onClick={(e) => handleDelete(t.id, e)} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black">DELETE</button>
                                  <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="px-5 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black">NO</button>
                               </div>
                            ) : (
                              <div className="flex gap-2">
                                {t.invoiceImage && (
                                  <button onClick={() => setViewingImage(t.invoiceImage!)} className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><i className="fas fa-eye"></i></button>
                                )}
                                <button onClick={(e) => handleEdit(t, e)} className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(t.id); }} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="md:hidden grid grid-cols-1 gap-6">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                       <div className="space-y-1">
                          <p className="font-black text-slate-800 text-xl leading-tight">{t.description}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{t.date} • {t.category}</p>
                       </div>
                       <span className={`text-xl font-black ${t.type === 'Expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {t.type === 'Expense' ? '-' : '+'}{t.amount.toLocaleString()}
                       </span>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                       {confirmDeleteId === t.id ? (
                          <div className="flex gap-2 w-full animate-in slide-in-from-right-2">
                             <button onClick={(e) => handleDelete(t.id, e)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black">CONFIRM DELETE</button>
                             <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black">BACK</button>
                          </div>
                       ) : (
                         <>
                            <button onClick={(e) => handleEdit(t, e)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase">Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(t.id); }} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><i className="fas fa-trash-alt"></i></button>
                            {t.invoiceImage && <button onClick={() => setViewingImage(t.invoiceImage!)} className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><i className="fas fa-eye"></i></button>}
                         </>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans pb-24 md:pb-0">
      {/* Lightbox */}
      {viewingImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={viewingImage} alt="Receipt" className="w-full h-auto max-h-[80vh] object-contain p-2" />
            <div className="p-8 bg-slate-50 flex justify-between items-center">
               <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Audit Archive Preview</h4>
               <button onClick={() => setViewingImage(null)} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black text-xs">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[250] px-8 py-4 rounded-full shadow-2xl text-white font-black animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-indigo-600' : 'bg-rose-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-slate-900 text-white md:h-screen sticky top-0 md:static z-40 print:hidden">
        <div className="p-8">
           <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg">
                 <i className="fas fa-vault"></i>
              </div>
              <div>
                 <h1 className="text-2xl font-black tracking-tighter">3ohda</h1>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enterprise v4.5</p>
              </div>
           </div>
           
           <nav className="space-y-3">
              {[
                { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
                { id: 'transactions', icon: 'fa-receipt', label: 'Ledger / العهدة' },
                { id: 'reports', icon: 'fa-file-signature', label: 'Settlement' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all font-black text-sm ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}>
                   <i className={`fas ${tab.icon} text-lg`}></i> {tab.label}
                </button>
              ))}
           </nav>
        </div>

        <div className="mt-auto p-8 hidden md:block">
           <button onClick={generateAI} disabled={isAiLoading} className="w-full py-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3">
              {isAiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
              {isAiLoading ? 'AUDITING...' : 'AI FINANCIAL AUDIT'}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full print:p-0">
        {aiInsights && (
          <div className="mb-10 p-8 bg-indigo-900 text-indigo-50 rounded-[2.5rem] shadow-2xl relative animate-in slide-in-from-top-4">
             <button onClick={() => setAiInsights(null)} className="absolute top-6 right-6 text-white/40 hover:text-white"><i className="fas fa-times-circle text-xl"></i></button>
             <h4 className="font-black text-xl mb-3 tracking-tight">AI Audit Findings</h4>
             <div className="whitespace-pre-line leading-relaxed text-indigo-100 font-medium">{aiInsights}</div>
          </div>
        )}
        {renderContent()}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around p-6 z-50 print:hidden shadow-lg">
        {['dashboard', 'transactions', 'reports'].map((id: any) => (
           <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1.5 ${activeTab === id ? 'text-indigo-600' : 'text-slate-300'}`}>
              <i className={`fas ${id === 'dashboard' ? 'fa-chart-pie' : id === 'transactions' ? 'fa-list' : 'fa-file-signature'} text-2xl`}></i>
              <span className="text-[10px] font-black uppercase">{id}</span>
           </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
