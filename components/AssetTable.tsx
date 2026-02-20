
import React, { useState } from 'react';
import { Asset, AssetStatus, Custodian } from '../types';

interface AssetTableProps {
  assets: Asset[];
  custodians: Custodian[];
  onUpdate: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({ assets, custodians, onUpdate, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-700';
      case AssetStatus.ASSIGNED: return 'bg-indigo-100 text-indigo-700';
      case AssetStatus.MAINTENANCE: return 'bg-amber-100 text-amber-700';
      case AssetStatus.RETIRED: return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial #</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Custodian</th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {assets.map((asset) => {
            const custodian = custodians.find(c => c.id === asset.custodianId);
            
            return (
              <tr key={asset.id} className="group hover:bg-slate-50 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                      <i className={`fas ${getCategoryIcon(asset.category)} text-xl`}></i>
                    </div>
                    <div>
                      <p className="font-black text-slate-800 leading-tight">{asset.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{asset.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-mono font-bold text-slate-600">{asset.serialNumber}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {custodian ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-[8px]">
                        <i className="fas fa-user"></i>
                      </div>
                      <span className="text-xs font-black text-slate-700">{custodian.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-800">
                  {asset.value.toLocaleString()} <span className="text-[10px] text-slate-400">EGP</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    {confirmDeleteId === asset.id ? (
                       <div className="flex gap-2 animate-in zoom-in duration-200">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onDelete(asset.id); setConfirmDeleteId(null); }}
                           className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[9px] font-black"
                         >DELETE</button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                           className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black"
                         >BACK</button>
                       </div>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdate(asset); }}
                          className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(asset.id); }}
                          className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {assets.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <i className="fas fa-search-minus text-4xl mb-4"></i>
          <p className="font-black uppercase text-xs tracking-widest">No assets in current inventory</p>
        </div>
      )}
    </div>
  );
};

function getCategoryIcon(cat: string) {
  switch (cat.toLowerCase()) {
    case 'laptops': return 'fa-laptop';
    case 'monitors': return 'fa-desktop';
    case 'mobile': return 'fa-mobile-screen';
    case 'printers': return 'fa-print';
    default: return 'fa-box';
  }
}
