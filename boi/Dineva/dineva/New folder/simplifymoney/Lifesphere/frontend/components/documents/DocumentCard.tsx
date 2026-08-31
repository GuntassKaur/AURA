'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, MapPin, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, Receipt, Plane, Shield } from 'lucide-react';
import { DocumentData, useDocumentStore } from '@/store/useDocumentStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';

interface DocumentCardProps {
  doc: DocumentData;
}

export default function DocumentCard({ doc }: DocumentCardProps) {
  const { setOpenedDoc, searchQuery } = useDocumentStore();
  const { memories } = useLifeDataStore();

  const isMatched = searchQuery
    ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  const isPassport = doc.category === 'government';
  const isUtility = doc.category === 'financial';
  const isWarranty = doc.category === 'warranty';
  const isTravel = doc.category === 'travel';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      onClick={() => setOpenedDoc(doc)}
      className={`rounded-3xl p-5 border transition-all duration-300 cursor-pointer text-left shadow-xs flex flex-col justify-between h-56 font-sans relative overflow-hidden group ${
        isPassport
          ? 'bg-[#1C2430] text-white border-[#2D3748] hover:border-[#5B5CE2]'
          : isUtility
          ? 'bg-white border-[#E5E3DC] hover:border-[#E98291]'
          : isWarranty
          ? 'bg-white border-[#E5E3DC] hover:border-[#E9A23B]'
          : 'bg-white border-[#E5E3DC] hover:border-[#5B5CE2]'
      } ${isMatched ? 'opacity-100' : 'opacity-25'}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg text-xs ${
              isPassport
                ? 'bg-[#2D3748] text-[#E8E7FF]'
                : isUtility
                ? 'bg-[#FBE8EB] text-[#E98291]'
                : isWarranty
                ? 'bg-[#FFF2D9] text-[#E9A23B]'
                : 'bg-[#E8E7FF] text-[#5B5CE2]'
            }`}>
              {isPassport ? <Shield size={14} /> : isUtility ? <Receipt size={14} /> : isTravel ? <Plane size={14} /> : <FileText size={14} />}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isPassport ? 'text-[#9A9C9F]' : 'text-[#6B6D73]'}`}>
              {doc.category}
            </span>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isPassport ? 'bg-[#2D3748] text-[#9A9C9F]' : 'bg-[#F7F6F2] text-[#9A9C9F]'}`}>
            {doc.documentNo || doc.fileType.toUpperCase()}
          </span>
        </div>

        <h3 className={`text-sm sm:text-base font-serif font-bold leading-snug ${isPassport ? 'text-white' : 'text-[#17181C]'}`}>
          {doc.title}
        </h3>

        <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isPassport ? 'text-[#9A9C9F]' : 'text-[#6B6D73]'}`}>
          {doc.summary}
        </p>
      </div>

      {/* Perforated Divider or Metric Strip */}
      <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono ${
        isPassport ? 'border-[#2D3748] text-[#9A9C9F]' : 'border-[#F0EFEA] text-[#6B6D73]'
      }`}>
        <div className="flex items-center gap-1.5 truncate">
          <Calendar size={11} className="shrink-0" />
          <span className="truncate">
            {doc.expiryDate ? `Expires: ${doc.expiryDate}` : doc.date}
          </span>
        </div>

        <span className={`font-semibold flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform ${
          isPassport ? 'text-[#E8E7FF]' : 'text-[#5B5CE2]'
        }`}>
          <span>Inspect</span>
          <ArrowRight size={11} />
        </span>
      </div>
    </motion.div>
  );
}
