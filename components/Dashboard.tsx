
import React from 'react';
import { Transaction, PettyCashStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  stats: PettyCashStats;
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, transactions }) => {
  const categoryData = React.useMemo(() => {
    const cats: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex md:block items-center justify-between">
          <div className="flex md:block items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg mb-0 md:mb-4">
              <i className="fas fa-arrow-down"></i>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Budget</span>
              <p className="text-xl md:text-3xl font-bold text-slate-800">{stats.totalBudget.toLocaleString()}</p>
            </div>
          </div>
          <span className="md:hidden text-xs text-slate-400">EGP</span>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex md:block items-center justify-between">
          <div className="flex md:block items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-lg mb-0 md:mb-4">
              <i className="fas fa-arrow-up"></i>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expenses</span>
              <p className="text-xl md:text-3xl font-bold text-slate-800">{stats.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <span className="md:hidden text-xs text-slate-400">EGP</span>
        </div>

        <div className={`p-5 md:p-6 rounded-2xl border shadow-sm transition-colors flex md:block items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1 ${stats.balance >= 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
          <div className="flex md:block items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg mb-0 md:mb-4">
              <i className="fas fa-wallet"></i>
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Balance</span>
              <p className="text-xl md:text-3xl font-bold">{stats.balance.toLocaleString()}</p>
            </div>
          </div>
          <span className="md:hidden text-xs text-white/50">EGP</span>
        </div>
      </div>

      {/* Expense Chart */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-6">Category Breakdown</h3>
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={80} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
