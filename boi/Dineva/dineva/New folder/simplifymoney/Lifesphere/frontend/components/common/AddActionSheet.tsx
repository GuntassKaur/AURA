'use client';

import React, { useState } from 'react';
import {
  Camera, FileText, CreditCard, Sparkles, Bell, Plane,
  Check, ArrowRight, Link as LinkIcon,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { useRouter } from 'next/navigation';
import LSModal from './LSModal';

interface AddActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalMode = 'menu' | 'photo' | 'document' | 'expense' | 'memory' | 'reminder';

// ─── Shared style tokens ──────────────────────────────────────────────────
const INPUT: React.CSSProperties = {
  width: '100%', background: '#F7F6F2', border: '1px solid #E5E3DC',
  borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#17181C',
  fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.12s',
};

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#17181C',
  marginBottom: 5, fontFamily: 'Inter, sans-serif',
};

const FORM_GAP: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };

// Responsive 2-col: collapses to 1-col on narrow screens
const TWO_COL: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12,
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = '#5B5CE2');
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = '#E5E3DC');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function AccentBlock({ bg, border, eyebrow, eyebrowColor, children }: {
  bg: string; border: string; eyebrow: string; eyebrowColor: string; children: React.ReactNode;
}) {
  return (
    <div style={{ padding: '12px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: eyebrowColor, display: 'flex', alignItems: 'center', gap: 4 }}>
        <LinkIcon size={11} /> {eyebrow}
      </div>
      {children}
    </div>
  );
}

// ─── CTA button (submit via form= attr) ───────────────────────────────────
function SubmitBtn({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <button type="submit" form="ls-active-form" style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '10px 18px', background: bg, border: 'none', borderRadius: 10,
      fontSize: 13, fontWeight: 600, color: '#FFFFFF', cursor: 'pointer',
      fontFamily: 'Inter, sans-serif',
    }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '10px 16px', background: 'transparent', border: '1px solid #E5E3DC',
      borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#5C5E66',
      cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
    }}>Back</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function AddActionSheet({ isOpen, onClose }: AddActionSheetProps) {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const { addPhoto, addDocument, addExpense, addMemory, addUpcomingItem, memories } = useLifeDataStore();
  const [mode, setMode] = useState<ModalMode>('menu');

  // Photo
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoLocation, setPhotoLocation] = useState('Goa, India');
  const [photoMemoryId, setPhotoMemoryId] = useState(memories[0]?.id || '');
  const [photoPeople, setPhotoPeople] = useState('Aman Gupta, Rhea Sen');

  // Document
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'travel'|'medical'|'financial'|'government'|'warranty'>('financial');
  const [docAmount, setDocAmount] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docLinkedMemory, setDocLinkedMemory] = useState('');
  const [docReminder, setDocReminder] = useState(true);

  // Expense
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<'Food'|'Stay'|'Travel'|'Activities'|'Shopping'|'Utilities'>('Food');
  const [expMemoryId, setExpMemoryId] = useState(memories[0]?.id || '');

  // Memory
  const [memTitle, setMemTitle] = useState('');
  const [memLocation, setMemLocation] = useState('');
  const [memCategory, setMemCategory] = useState<'travel'|'personal'|'photos'>('travel');

  // Reminder
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('Tomorrow · 10:00 AM');
  const [reminderAmount, setReminderAmount] = useState('');

  const handleClose = () => { setMode('menu'); onClose(); };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;
    const peopleArr = photoPeople.split(',').map(p => p.trim()).filter(Boolean);
    addPhoto({
      title: photoTitle, category: 'trip', date: 'Just now', location: photoLocation || 'Delhi, India',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      summary: `Captured moment: ${photoTitle}`, detectedObjects: ['Memory', 'Capture'],
      connectedMemoryId: photoMemoryId || undefined,
      people: peopleArr.length > 0 ? peopleArr : undefined,
      exif: { camera: 'iPhone 15 Pro', aperture: 'f/1.8', exposure: '1/120s', iso: '125' },
    });
    addNotification({ type: 'success', title: 'Moment Connected', message: `"${photoTitle}" was linked to your life chapter.`, duration: 3500 });
    handleClose(); router.push('/photos');
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    const docId = addDocument({
      title: docTitle, fileType: 'pdf', category: docCategory, date: 'Today',
      amount: docAmount ? `\u20B9${docAmount}` : undefined,
      summary: `Archived ${docCategory} record: ${docTitle}. Intelligent OCR processing completed.`,
      ocrText: `Document: ${docTitle}. Category: ${docCategory}. Parsed by LifeSphere.`,
      tags: [docCategory.toUpperCase(), 'Uploaded', 'Active'],
    });
    if (docReminder) {
      addUpcomingItem({
        groupKey: 'SCHEDULED', groupLabel: 'Next Week', title: `${docTitle} review`,
        category: docCategory === 'financial' ? 'Bills' : 'Documents',
        amount: docAmount ? `\u20B9${docAmount}` : undefined,
        description: `Scheduled action for ${docTitle}.`, actionLabel: 'Check record',
        dotColor: '#5B5CE2', dueDate: docExpiry || 'Next Week', urgency: 'info', relatedEntityId: docId,
      });
    }
    addNotification({ type: 'success', title: 'Document Digitized', message: `"${docTitle}" archived with automated life reminders.`, duration: 3500 });
    handleClose(); router.push('/documents');
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(expAmount) || 0;
    if (!expTitle.trim() || numAmount <= 0) return;
    addExpense(
      { title: expTitle, amount: numAmount, formattedAmount: `\u20B9${numAmount.toLocaleString()}`, category: expCategory, date: 'Today', paymentMethod: 'UPI' },
      expMemoryId || undefined,
    );
    const linkedMem = memories.find(m => m.id === expMemoryId);
    addNotification({ type: 'success', title: 'Expense Connected', message: `\u20B9${numAmount.toLocaleString()} recorded and linked to ${linkedMem?.title || 'Personal Ledger'}.`, duration: 4000 });
    handleClose(); router.push('/timeline');
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim()) return;
    addMemory({
      title: memTitle, type: 'trip', category: memCategory, date: 'Aug 2026',
      location: memLocation || 'India', confidenceScore: 99,
      summary: `Newly created life chapter: ${memTitle}.`,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      relatedDocIds: [], photoIds: [], expenses: [], totalExpense: '\u20B90',
      people: ['Guntass Kaur'], places: [memLocation || 'Destination'],
      journeySteps: [{ title: 'Chapter Created', desc: `Life milestone recorded: ${memTitle}` }],
    });
    addNotification({ type: 'success', title: 'Life Chapter Created', message: `"${memTitle}" added to your chronological memory stream.`, duration: 3500 });
    handleClose(); router.push('/timeline');
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    addUpcomingItem({
      groupKey: 'UPCOMING', groupLabel: reminderDate, title: reminderTitle,
      category: reminderAmount ? 'Bills' : 'Personal',
      amount: reminderAmount ? `\u20B9${reminderAmount}` : undefined,
      description: `Scheduled reminder: ${reminderTitle}.`,
      actionLabel: 'Mark Done', dotColor: '#5B5CE2', dueDate: reminderDate, urgency: 'info',
    });
    addNotification({ type: 'success', title: 'Reminder Scheduled', message: `"${reminderTitle}" placed on your Upcoming time horizon.`, duration: 3500 });
    handleClose(); router.push('/upcoming');
  };

  // ── Options ────────────────────────────────────────────────────────────────
  const options = [
    { mode: 'photo' as ModalMode, label: 'Add Photo Moment', icon: Camera, accent: '#5B5CE2', bg: '#E8E7FF', desc: 'Connect a photograph to a trip, place or person' },
    { mode: 'document' as ModalMode, label: 'Archive Document', icon: FileText, accent: '#D4922A', bg: '#FFF2D9', desc: 'Digitize passport, tickets, invoices, warranties' },
    { mode: 'expense' as ModalMode, label: 'Log Connected Expense', icon: CreditCard, accent: '#2E8B72', bg: '#E2F3EC', desc: 'Link spending directly to a life chapter' },
    { mode: 'memory' as ModalMode, label: 'New Life Chapter', icon: Sparkles, accent: '#5B5CE2', bg: '#E8E7FF', desc: 'Record a new journey, milestone or celebration' },
    { mode: 'reminder' as ModalMode, label: 'Set Obligation / Bill', icon: Bell, accent: '#E98291', bg: '#FBE8EB', desc: 'Schedule utility due dates or task alerts' },
    { mode: 'memory' as ModalMode, label: 'Plan Trip Dossier', icon: Plane, accent: '#2E8B72', bg: '#E2F3EC', desc: 'Assemble itinerary, tickets, hotel bookings' },
  ];

  const titleMap: Record<ModalMode, string> = {
    menu: 'Add to Your Life OS',
    photo: 'Connect Photo Moment',
    document: 'Archive Digital Document',
    expense: 'Log Contextual Expense',
    memory: 'Create Life Chapter',
    reminder: 'Schedule Upcoming Obligation',
  };

  const subtitleMap: Record<ModalMode, string | undefined> = {
    menu: 'Choose what to connect to LifeSphere.',
    photo: undefined,
    document: 'Keep an important record connected to your life, with useful details extracted automatically.',
    expense: undefined,
    memory: undefined,
    reminder: undefined,
  };

  // Footer — always visible at bottom of modal
  const footer = mode !== 'menu' ? (
    <>
      <BackBtn onClick={() => setMode('menu')} />
      <SubmitBtn bg={
        mode === 'expense' ? '#2E8B72' :
        mode === 'reminder' ? '#E98291' :
        mode === 'document' ? '#D4922A' : '#5B5CE2'
      }>
        <Check size={14} />
        {mode === 'photo' && 'Save & Connect Moment'}
        {mode === 'document' && 'Digitize & Archive'}
        {mode === 'expense' && 'Record Expense'}
        {mode === 'memory' && 'Create Life Chapter'}
        {mode === 'reminder' && 'Schedule Reminder'}
      </SubmitBtn>
    </>
  ) : undefined;

  // Body — only this scrolls inside LSModal
  const body = (
    <>
      {/* MENU */}
      {mode === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={`add-opt-${opt.label}`}
                onClick={() => setMode(opt.mode)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: 'transparent',
                  border: '1px solid transparent', borderRadius: 12,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F7F6F2'; e.currentTarget.style.borderColor = '#E5E3DC'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color: opt.accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#17181C', fontFamily: 'Inter, sans-serif' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: '#6B6D73', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{opt.desc}</div>
                </div>
                <ArrowRight size={13} style={{ color: '#9A9C9F', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}

      {/* PHOTO FORM */}
      {mode === 'photo' && (
        <form id="ls-active-form" onSubmit={handleSavePhoto} style={FORM_GAP}>
          <Field label="Moment Title *">
            <input type="text" required placeholder="e.g., Morning Coffee at Vagator Cliff" value={photoTitle} onChange={e => setPhotoTitle(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <AccentBlock bg="#E8E7FF20" border="#5B5CE230" eyebrow="Connect this moment to your life" eyebrowColor="#5B5CE2">
            <Field label="Parent Chapter / Memory">
              <select value={photoMemoryId} onChange={e => setPhotoMemoryId(e.target.value)} style={{ ...INPUT, background: '#FFFFFF' }} onFocus={onFocus} onBlur={onBlur}>
                <option value="">None (Independent Moment)</option>
                {memories.map(m => <option key={`photo-mem-${m.id}`} value={m.id}>{m.title}</option>)}
              </select>
            </Field>
            <div style={TWO_COL}>
              <Field label="Place / Location">
                <input type="text" placeholder="e.g., Goa, India" value={photoLocation} onChange={e => setPhotoLocation(e.target.value)} style={{ ...INPUT, background: '#FFFFFF' }} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="People with you">
                <input type="text" placeholder="e.g., Aman, Rhea" value={photoPeople} onChange={e => setPhotoPeople(e.target.value)} style={{ ...INPUT, background: '#FFFFFF' }} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>
          </AccentBlock>
        </form>
      )}

      {/* DOCUMENT FORM */}
      {mode === 'document' && (
        <form id="ls-active-form" onSubmit={handleSaveDocument} style={FORM_GAP}>
          <Field label="Document / Artifact Name *">
            <input type="text" required placeholder="e.g., International Driving Permit 2026" value={docTitle} onChange={e => setDocTitle(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Archive Category">
            <select value={docCategory} onChange={e => setDocCategory(e.target.value as any)} style={INPUT} onFocus={onFocus} onBlur={onBlur}>
              <option value="financial">Financial / Utility Invoice</option>
              <option value="travel">Travel Boarding Pass / Voucher</option>
              <option value="government">Government Identification</option>
              <option value="warranty">Product Warranty</option>
              <option value="medical">Medical Report</option>
            </select>
          </Field>
          <div style={TWO_COL}>
            <Field label="Amount (if bill)">
              <input type="number" placeholder="e.g., 4230" value={docAmount} onChange={e => setDocAmount(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Expiry / Due Date">
              <input type="text" placeholder="e.g., Mar 2027" value={docExpiry} onChange={e => setDocExpiry(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
          <Field label="Connect to a Memory (optional)">
            <select value={docLinkedMemory} onChange={e => setDocLinkedMemory(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur}>
              <option value="">None</option>
              {memories.map(m => <option key={`doc-mem-${m.id}`} value={m.id}>{m.title}</option>)}
            </select>
          </Field>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 12px', background: '#F7F6F2', border: '1px solid #E5E3DC', borderRadius: 10 }}>
            <input type="checkbox" checked={docReminder} onChange={e => setDocReminder(e.target.checked)} style={{ marginTop: 2, accentColor: '#5B5CE2', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#17181C', fontFamily: 'Inter, sans-serif', lineHeight: 1.45 }}>
              Automatically schedule a life reminder for expiry / payment due date
            </span>
          </label>
        </form>
      )}

      {/* EXPENSE FORM */}
      {mode === 'expense' && (
        <form id="ls-active-form" onSubmit={handleSaveExpense} style={FORM_GAP}>
          <Field label="Expense Title *">
            <input type="text" required placeholder="e.g., Coastal Seafood Lunch at Brittos" value={expTitle} onChange={e => setExpTitle(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={TWO_COL}>
            <Field label="Amount (₹) *">
              <input type="number" required placeholder="e.g., 1850" value={expAmount} onChange={e => setExpAmount(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Category">
              <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} style={INPUT} onFocus={onFocus} onBlur={onBlur}>
                <option value="Food">Food &amp; Dining</option>
                <option value="Stay">Accommodation / Hotel</option>
                <option value="Travel">Flight / Train / Fuel</option>
                <option value="Activities">Activities &amp; Entry</option>
                <option value="Shopping">Shopping &amp; Gear</option>
                <option value="Utilities">Household Utilities</option>
              </select>
            </Field>
          </div>
          <AccentBlock bg="#E2F3EC30" border="#2E8B7230" eyebrow="Connect Expense to Life Chapter" eyebrowColor="#2E8B72">
            <select value={expMemoryId} onChange={e => setExpMemoryId(e.target.value)} style={{ ...INPUT, background: '#FFFFFF' }} onFocus={onFocus} onBlur={onBlur}>
              <option value="">Personal Ledger (No linked trip)</option>
              {memories.map(m => <option key={`exp-mem-${m.id}`} value={m.id}>{m.title} ({m.date})</option>)}
            </select>
          </AccentBlock>
        </form>
      )}

      {/* MEMORY FORM */}
      {mode === 'memory' && (
        <form id="ls-active-form" onSubmit={handleSaveMemory} style={FORM_GAP}>
          <Field label="Life Chapter / Journey Title *">
            <input type="text" required placeholder="e.g., Ladakh Motorcycle Expedition 2026" value={memTitle} onChange={e => setMemTitle(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={TWO_COL}>
            <Field label="Primary Place">
              <input type="text" placeholder="e.g., Leh, Ladakh" value={memLocation} onChange={e => setMemLocation(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Chapter Type">
              <select value={memCategory} onChange={e => setMemCategory(e.target.value as any)} style={INPUT} onFocus={onFocus} onBlur={onBlur}>
                <option value="travel">Travel Journey</option>
                <option value="personal">Career Milestone</option>
                <option value="photos">Family Celebration</option>
              </select>
            </Field>
          </div>
        </form>
      )}

      {/* REMINDER FORM */}
      {mode === 'reminder' && (
        <form id="ls-active-form" onSubmit={handleSaveReminder} style={FORM_GAP}>
          <Field label="Obligation Title *">
            <input type="text" required placeholder="e.g., Annual Health Insurance Premium" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={TWO_COL}>
            <Field label="Due Date">
              <input type="text" placeholder="e.g., Sep 15, 2026" value={reminderDate} onChange={e => setReminderDate(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Amount (if bill)">
              <input type="number" placeholder="e.g., 6800" value={reminderAmount} onChange={e => setReminderAmount(e.target.value)} style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
        </form>
      )}
    </>
  );

  return (
    <LSModal
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow="Connect to LifeSphere"
      title={titleMap[mode]}
      subtitle={subtitleMap[mode]}
      footer={footer}
    >
      {body}
    </LSModal>
  );
}
