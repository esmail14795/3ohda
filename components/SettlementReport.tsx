
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';

interface SettlementReportProps {
  transactions: Transaction[];
}

export const SettlementReport: React.FC<SettlementReportProps> = ({ transactions }) => {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [reportTitle, setReportTitle] = useState('3ohda Settlement Report / تقرير تسوية العهدة');

  const reportExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'Expense' && t.date >= dateFrom && t.date <= dateTo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, dateFrom, dateTo]);

  const totalAmount = reportExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalInvoices = reportExpenses.filter(t => t.invoiceImage).length;

  const handlePrint = () => {
    // Direct call to print is more reliable in most browsers
    window.print();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Control Panel (Hidden in Print) */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 print:hidden relative z-10">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            
            {/* Report Title Input */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                Report Title / مسمى التقرير
              </label>
              <input 
                type="text" 
                value={reportTitle} 
                onChange={e => setReportTitle(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                placeholder="Enter report title..."
              />
            </div>

            {/* Date Range Selectors */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">From / من</label>
                 <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">To / إلى</label>
                 <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" />
               </div>
            </div>

            {/* Print Button */}
            <div className="lg:col-span-3">
              <button 
                onClick={handlePrint}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <i className="fas fa-print text-lg"></i> 
                <span className="tracking-tight">PRINT REPORT</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Actual Printable Report */}
      <div id="printable-report" className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-2xl border border-slate-100 print:shadow-none print:border-none print:p-0 print:m-0">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-12 mb-12">
           <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black">3</div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{reportTitle}</h2>
                   <p className="text-sm font-bold text-slate-500">Financial Department / الإدارة المالية</p>
                </div>
             </div>
             <div className="flex gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest pt-2">
                <span>Period: {dateFrom} - {dateTo}</span>
                <span>Ref: SET-{new Date().getTime().toString().slice(-6)}</span>
             </div>
           </div>
           <div className="text-right space-y-2">
              <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-[1.5rem] inline-block border-2 border-emerald-100 print:border-emerald-500">
                <p className="text-[10px] font-black uppercase mb-1 text-center">Total / الإجمالي</p>
                <p className="text-3xl font-black">{totalAmount.toLocaleString()} <span className="text-sm">EGP</span></p>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase">{reportExpenses.length} Items | {totalInvoices} Receipts Attached</p>
           </div>
        </div>

        <div className="mb-12 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date / التاريخ</th>
                <th className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Description / البيان</th>
                <th className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</th>
                <th className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Amount / القيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportExpenses.length > 0 ? reportExpenses.map((t) => (
                <tr key={t.id} className="print:break-inside-avoid">
                  <td className="py-5 text-sm font-bold text-slate-600">{t.date}</td>
                  <td className="py-5">
                    <p className="text-sm font-black text-slate-800">{t.description}</p>
                    {t.invoiceImage && <span className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1 mt-1"><i className="fas fa-check-circle"></i> Receipt Archived</span>}
                  </td>
                  <td className="py-5">
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500 print:bg-transparent print:border print:border-slate-200">{t.category}</span>
                  </td>
                  <td className="py-5 text-right font-black text-slate-900">{t.amount.toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No expenses found for this period</td>
                </tr>
              )}
            </tbody>
            <tfoot>
               <tr className="border-t-4 border-slate-900">
                 <td colSpan={3} className="py-8 text-right font-black text-slate-900 text-lg uppercase">Total Reimbursement Required / إجمالي مبلغ التسوية</td>
                 <td className="py-8 text-right font-black text-slate-900 text-2xl">{totalAmount.toLocaleString()} EGP</td>
               </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-12 mt-20 pt-12 border-t border-slate-100 text-center print:border-slate-300">
           <div className="space-y-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prepared By / العهدة طرف</p>
              <div className="border-b-2 border-slate-100 w-3/4 mx-auto pb-4"></div>
              <p className="text-xs font-black text-slate-800 uppercase">Signature</p>
           </div>
           <div className="space-y-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified By / المراجع المالي</p>
              <div className="border-b-2 border-slate-100 w-3/4 mx-auto pb-4"></div>
              <p className="text-xs font-black text-slate-800 uppercase">Reviewer</p>
           </div>
           <div className="space-y-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved By / المدير المالي</p>
              <div className="border-b-2 border-slate-100 w-3/4 mx-auto pb-4"></div>
              <p className="text-xs font-black text-slate-800 uppercase">Final Approval</p>
           </div>
        </div>
      </div>
    </div>
  );
};
