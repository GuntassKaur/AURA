'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { DocumentData, useDocumentStore, SmartCollectionType } from '@/store/useDocumentStore';
import DocumentCard from './DocumentCard';
import DocumentViewer from './DocumentViewer';

const mockDocuments: DocumentData[] = [
  {
    id: 'doc-1',
    title: 'Taj Exotica Hotel Invoice',
    fileType: 'pdf',
    category: 'financial',
    date: 'April 12, 2026',
    location: 'Goa, India',
    confidenceScore: 98,
    summary: 'Hotel bill for 3 nights suite booking. Total amount ₹42,500 inclusive of taxes. Mapped to Goa Trip.',
    ocrText: 'TAJ EXOTICA RESORT & SPA GOA\nInvoice No: TX-90210\nDate: 12-04-2026\nDescription: Luxury Suite Booking\nNet Amount: INR 36,016.95\nGST 18%: INR 6,483.05\nTotal Paid: INR 42,500.00',
    extractedMetadata: {
      vendor: 'Taj Exotica Goa',
      amount: '₹42,500',
      documentNo: 'TX-90210',
      entities: ['Taj Resort', 'Luxury Suite', 'Goa Tourism']
    },
    tags: ['Goa Trip', 'Invoice', 'Accommodation']
  },
  {
    id: 'doc-2',
    title: 'Samsung AC 5Yr Warranty Card',
    fileType: 'image',
    category: 'warranty',
    date: 'December 16, 2025',
    location: 'Living Room',
    confidenceScore: 96,
    summary: 'Warranty registration card for Split AC model AR18CY3AQWK. Covers compressor repairs for 5 years until December 2030.',
    ocrText: 'SAMSUNG ELECTRONICS INDIA\nCertificate of Warranty\nProduct: Split Air Conditioner\nModel Code: AR18CY3AQWK\nSerial No: AC-98127391-B\nPurchase Date: 16-12-2025',
    extractedMetadata: {
      vendor: 'Samsung India',
      expiryDate: '2030-12-16',
      documentNo: 'AC-98127391-B',
      entities: ['Compressor', 'Split AC', 'Warranty']
    },
    tags: ['Warranty', 'Home Appliance', 'Samsung']
  },
  {
    id: 'doc-3',
    title: 'Max Blood Lab Report',
    fileType: 'pdf',
    category: 'medical',
    date: 'January 21, 2026',
    location: 'Max Labs Delhi',
    confidenceScore: 94,
    summary: 'Annual metabolic panel blood test. Highlights show normal glucose and kidney profiles.',
    ocrText: 'MAX SUPER SPECIALITY HOSPITAL\nDepartment of Pathology\nTest: Lipid Profile & CBC\nCholesterol Total: 215 mg/dL\nGlucose Fasting: 92 mg/dL',
    extractedMetadata: {
      vendor: 'Max Labs',
      documentNo: 'LAB-782910',
      entities: ['Lipid Profile', 'Cholesterol', 'Glucose']
    },
    tags: ['Health', 'Medical Report', 'Max Labs']
  },
  {
    id: 'doc-4',
    title: 'Indigo Flight Boarding Pass',
    fileType: 'pdf',
    category: 'travel',
    date: 'April 10, 2026',
    location: 'DEL Airport',
    confidenceScore: 97,
    summary: 'Boarding pass for flight 6E-2018 from New Delhi to Goa. Seat 12D, boarding time 05:15.',
    ocrText: 'INDIGO AIRLINES\nBoarding Pass\nFlight: 6E-2018\nDate: 10 Apr 2026\nFrom: DEL\nTo: GOI\nSeat: 12D',
    extractedMetadata: {
      vendor: 'Indigo Airlines',
      documentNo: '6E-2018',
      entities: ['Boarding Pass', 'New Delhi', 'Goa Flight']
    },
    tags: ['Travel', 'Goa Trip', 'Indigo']
  },
  {
    id: 'doc-5',
    title: 'Passport Identity Credential',
    fileType: 'image',
    category: 'government',
    date: 'May 18, 2024',
    location: 'Secure Vault',
    confidenceScore: 99,
    summary: 'Verified government passport photo identity credential. Active for international travel.',
    ocrText: 'REPUBLIC OF INDIA\nPassport\nType: P\nCountry Code: IND\nPassport No: Z9012345\nExpiry: 18 Dec 2026',
    extractedMetadata: {
      vendor: 'Government of India',
      expiryDate: 'December 2026',
      documentNo: 'Z9012345',
      entities: ['Passport', 'Govt Identity', 'National ID']
    },
    tags: ['Passport', 'ID Card', 'Government']
  }
];

export default function DocumentsVault() {
  const { 
    activeCollection, setActiveCollection, 
    selectedDoc,
    searchQuery, setSearchQuery 
  } = useDocumentStore();

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesCol = activeCollection === 'all' || doc.category === activeCollection;
    const matchesSearch = searchQuery
      ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCol && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 pt-4 sm:pt-8 pb-24 font-sans text-left">
      
      {/* 1. Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Document Archive</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">Documents</h1>
        </div>

        <div className="bg-bg-surface border border-white/[0.08] rounded-full px-4 py-2 flex items-center space-x-2.5 w-full sm:w-72 shadow-lg">
          <Search size={14} className="text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document archive…"
            className="w-full bg-transparent border-none text-xs text-text-primary placeholder-text-tertiary focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-6 text-sm">
        {[
          { id: 'all', label: 'All Artifacts' },
          { id: 'travel', label: 'Travel' },
          { id: 'medical', label: 'Health' },
          { id: 'financial', label: 'Finance' },
          { id: 'government', label: 'Government' },
          { id: 'warranty', label: 'Subscriptions & Warranty' }
        ].map(col => {
          const active = activeCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id as SmartCollectionType)}
              className={`transition-all font-medium cursor-pointer ${
                active 
                  ? 'text-text-primary border-b-2 border-accent-primary pb-1 font-semibold' 
                  : 'text-text-secondary hover:text-text-primary pb-1'
              }`}
            >
              {col.label}
            </button>
          );
        })}
      </div>

      {/* 2. Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Document Cards Feed */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence>
            {filteredDocs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </AnimatePresence>
        </div>

        {/* Selected Document Details Inspector */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-6 sticky top-24 shadow-2xl">
          {selectedDoc ? (
            <div className="space-y-5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-accent-primary">
                <Sparkles size={14} />
                <span>Document Insight</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary">{selectedDoc.title}</h3>
                <div className="text-xs font-mono-meta text-text-secondary mt-1 capitalize">{selectedDoc.category} · {selectedDoc.date}</div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-xs font-semibold text-text-secondary">Summary</div>
                <p className="text-xs text-text-primary leading-relaxed p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  {selectedDoc.summary}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono-meta text-text-secondary pt-2 border-t border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <Calendar size={13} className="text-text-secondary" />
                  <span>Date: <span className="text-text-primary">{selectedDoc.date}</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={13} className="text-text-secondary" />
                  <span>Location: <span className="text-text-primary">{selectedDoc.location}</span></span>
                </div>
                {selectedDoc.extractedMetadata.expiryDate && (
                  <div className="text-accent-warm font-semibold flex items-center space-x-1.5 pt-1">
                    <ShieldCheck size={14} />
                    <span>Expires: {selectedDoc.extractedMetadata.expiryDate}</span>
                  </div>
                )}
              </div>

              {selectedDoc.id === 'doc-5' && (
                <button 
                  onClick={() => alert("Passport renewal window opens in 30 days.")}
                  className="w-full py-3 bg-accent-warm/15 hover:bg-accent-warm/25 text-accent-warm font-semibold text-xs rounded-full border border-accent-warm/30 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  <span>Renew Passport →</span>
                </button>
              )}

              <button 
                onClick={() => useDocumentStore.getState().setOpenedDoc(selectedDoc)}
                className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs rounded-full shadow-lg shadow-accent-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Inspect Split View</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-text-secondary font-sans">
              Select a document to inspect details
            </div>
          )}
        </div>

      </div>

      <DocumentViewer />
    </div>
  );
}
