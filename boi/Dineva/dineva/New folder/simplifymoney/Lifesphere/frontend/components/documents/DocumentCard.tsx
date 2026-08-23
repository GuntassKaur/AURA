'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { DocumentData, useDocumentStore } from '@/store/useDocumentStore';

interface DocumentCardProps {
  doc: DocumentData;
}

export default function DocumentCard({ doc }: DocumentCardProps) {
  const { selectedDoc, setSelectedDoc, setOpenedDoc, searchQuery } = useDocumentStore();
  const isSelected = selectedDoc?.id === doc.id;

  const isMatched = searchQuery
    ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      onClick={() => setSelectedDoc(doc)}
      onDoubleClick={() => setOpenedDoc(doc)}
      className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer text-left shadow-xl font-sans ${
        isSelected 
          ? 'bg-bg-surface border-accent-primary ring-1 ring-accent-primary/30' 
          : 'bg-bg-surface/80 hover:bg-bg-surface border-white/[0.08] hover:border-white/20'
      } ${isMatched ? 'opacity-100' : 'opacity-20'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-text-primary">
            <FileText size={18} className="text-accent-primary" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono-meta text-text-secondary">
              <span className="capitalize">{doc.category}</span>
              <span>·</span>
              <span>{doc.date}</span>
            </div>
            <h3 className="text-base font-bold text-text-primary mt-0.5">{doc.title}</h3>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenedDoc(doc);
          }}
          className="flex items-center space-x-1 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <span>Inspect</span>
          <ArrowRight size={12} />
        </button>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mt-3.5 line-clamp-2">
        {doc.summary}
      </p>

      <div className="flex items-center space-x-4 mt-4 text-xs font-mono-meta text-text-secondary">
        <span className="flex items-center space-x-1.5">
          <MapPin size={12} className="text-text-secondary" />
          <span>{doc.location}</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <Calendar size={12} className="text-text-secondary" />
          <span>{doc.extractedMetadata.expiryDate ? `Expires: ${doc.extractedMetadata.expiryDate}` : doc.date}</span>
        </span>
      </div>
    </motion.div>
  );
}
