'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { saveOnboarding } from '@/actions/user';
import { submitWeeklyLog, getLogsHistory } from '@/actions/log';
import { sendMessageToCoach, triggerAnomalySweep, resolveAnomaly, fetchLinkedInPost } from '@/actions/coach';

export default function EcoSphereAppMain() {
  const {
    view,
    tab,
    user,
    logsList,
    anomaly,
    gridCleanState,
    sim,
    chat,
    setView,
    setTab,
    setUser,
    setLogsList,
    setAnomaly,
    setGridCleanState,
    updateSim,
    appendMessage
  } = useAppStore();

  // Onboarding state
  const [onbStep, setOnbStep] = useState(1);
  const [zipInput, setZipInput] = useState('11201');
  const [homeType, setHomeType] = useState<'Apartment' | 'Townhouse' | 'Detached'>('Apartment');
  const [gasCommute, setGasCommute] = useState(5);
  const [transitCommute, setTransitCommute] = useState(15);
  const [autoMeter, setAutoMeter] = useState(true);

  // UI modals
  const [loginModal, setLoginModal] = useState(false);
  const [linkedinModal, setLinkedinModal] = useState(false);
  const [linkedinText, setLinkedinText] = useState('');
  const [linkedinTone, setLinkedinTone] = useState<'professional' | 'celebratory' | 'analytical'>('professional');
  const [copyStatus, setCopyStatus] = useState('Copy to Clipboard');
  const [onbLoading, setOnbLoading] = useState(false);

  // Chat/Coach
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Logging
  const [logCat, setLogCat] = useState<'energy' | 'transport'>('energy');
  const [logEnergyAuto, setLogEnergyAuto] = useState(true);
  const [inputKwh, setInputKwh] = useState(112);
  const [inputGas, setInputGas] = useState(12);
  const [inputRef, setInputRef] = useState(168);
  const [inputCar, setInputCar] = useState(35);
  const [inputEv, setInputEv] = useState(80);
  const [chkCompost, setChkCompost] = useState(false);
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [foodProfile, setFoodProfile] = useState('Low Impact');

  // Anomaly sweep — only runs once when app view is active
  const anomalySweptRef = useRef(false);
  useEffect(() => {
    if (view === 'app' && !anomaly && !anomalySweptRef.current) {
      anomalySweptRef.current = true;
      triggerAnomalySweep()
        .then(res => setAnomaly(res))
        .catch(err => console.warn('Anomaly sweep skipped (demo mode):', err));
    }
  }, [view, anomaly, setAnomaly]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat, chatLoading]);

  // ── HANDLERS ──────────────────────────────────────────────

  const handleOnboardingSubmit = async () => {
    setOnbLoading(true);
    try {
      const savedUser = await saveOnboarding({
        zipCode: zipInput,
        homeType,
        gasCommute,
        transitCommute,
        email: 'demo@aura.org',
        name: 'Demo User'
      });
      setUser(savedUser);
      setView('app');
      const history = await getLogsHistory(savedUser.email);
      setLogsList(history);
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setOnbLoading(false);
    }
  };

  const handleTabSwitch = async (tabName: 'dash' | 'weekly-log' | 'simulator' | 'coach') => {
    setTab(tabName);
    if (tabName === 'weekly-log' && user) {
      const history = await getLogsHistory(user.email);
      setLogsList(history);
    }
  };

  const handleLogSubmit = async () => {
    setLogSubmitting(true);
    setLogSuccess(false);
    try {
      const result = await submitWeeklyLog({
        weekNumber: 24,
        electricityKwh: logEnergyAuto ? 112 : inputKwh,
        gasTherms: inputGas,
        carMiles: inputCar,
        evMiles: inputEv,
        composted: chkCompost,
        userEmail: user?.email || 'demo@aura.org'
      });
      if (result.success) {
        if (user) setUser({ ...user, currentScore: result.newScore });
        setLogsList(result.logsList);
        setLogSuccess(true);
        setTimeout(() => {
          setLogSuccess(false);
          setTab('dash');
        }, 1200);
      }
    } catch (err) {
      console.error('Log submit failed:', err);
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleChatSend = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim()) return;
    appendMessage('user', textToSend);
    if (!queryText) setChatInput('');
    setChatLoading(true);
    try {
      const history = chat.map(c => ({ role: c.role, text: c.text }));
      const result = await sendMessageToCoach({ history, query: textToSend, userEmail: user?.email || 'demo@aura.org' });
      appendMessage('model', result.response);
    } catch {
      appendMessage('model', 'Sorry, I encountered an issue. Please try again in a moment.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGridToggle = () => {
    setGridCleanState(!gridCleanState);
    if (user) {
      const scoreAdjust = !gridCleanState ? 6 : -6;
      setUser({ ...user, currentScore: Math.max(10, Math.min(100, user.currentScore + scoreAdjust)) });
    }
  };

  const handleDiagnoseAnomaly = () => {
    setTab('coach');
    handleChatSend('Why did my energy usage spike on June 8th?');
  };

  const handleDismissAnomaly = async () => {
    if (anomaly?._id) {
      await resolveAnomaly(String(anomaly._id));
      setAnomaly(null);
    }
  };

  const getProjectedMetrics = () => {
    const baseCO2 = 108.0;
    const tempSavings = (sim.temp - 65) * 1.8;
    const chargeSavings = (sim.charge / 100) * 14;
    const compostSavings = (sim.compost / 100) * 8.5;
    const projectedCO2 = Math.max(12, baseCO2 - tempSavings - chargeSavings - compostSavings);
    const pctSaved = Math.round(((baseCO2 - projectedCO2) / baseCO2) * 100);
    const cashSavings = Math.round((tempSavings + chargeSavings) * 45 + compostSavings * 10);
    const endpointY = 170 - Math.round((projectedCO2 / baseCO2) * 150);
    const midY1 = 170 - Math.round(((baseCO2 - (baseCO2 - projectedCO2) * 0.2) / baseCO2) * 150);
    const midY2 = 170 - Math.round(((baseCO2 - (baseCO2 - projectedCO2) * 0.5) / baseCO2) * 150);
    const curveD = `M40,170 L128,${midY1} L216,${midY2} L304,${midY2 - 15} L392,${midY2 - 25} L480,${endpointY}`;
    return { projectedCO2, pctSaved, cashSavings, curveD };
  };

  const { projectedCO2, pctSaved, cashSavings, curveD } = getProjectedMetrics();

  const handleOpenLinkedIn = async () => {
    setCopyStatus('Copy to Clipboard');
    setLinkedinText('Generating post...');
    setLinkedinModal(true);
    try {
      const response = await fetchLinkedInPost(pctSaved, Math.round(108 - projectedCO2), linkedinTone);
      setLinkedinText(response.post);
    } catch {
      setLinkedinText('Failed to generate post. Please try again.');
    }
  };

  const handleToneChange = async (newTone: 'professional' | 'celebratory' | 'analytical') => {
    setLinkedinTone(newTone);
    setCopyStatus('Copy to Clipboard');
    setLinkedinText('Regenerating...');
    try {
      const response = await fetchLinkedInPost(pctSaved, Math.round(108 - projectedCO2), newTone);
      setLinkedinText(response.post);
    } catch {
      setLinkedinText('Failed to generate post.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkedinText);
    setCopyStatus('✓ Copied!');
    setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
  };

  const scoreGrade = () => {
    const s = user?.currentScore ?? 84;
    if (s >= 95) return 'A+';
    if (s >= 90) return 'A';
    if (s >= 85) return 'A-';
    if (s >= 80) return 'B+';
    if (s >= 75) return 'B';
    return 'B-';
  };

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg-obsidian)', color: 'var(--text-primary)' }}>

      {/* ═══════════════════════════════════════════
          1. LANDING / AUTH PAGE
          ═══════════════════════════════════════════ */}
      {view === 'auth' && (
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)' }}
            className="flex justify-between items-center h-16 px-6 md:px-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }}></span>
              <span className="font-semibold text-lg font-display">EcoSphere AI</span>
            </div>
            <nav className="hidden md:flex gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="hover:text-white cursor-pointer transition-colors">Features</span>
              <span className="hover:text-white cursor-pointer transition-colors">Analytics</span>
              <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
            </nav>
            <button className="btn btn-secondary" onClick={() => setLoginModal(true)}>Sign In</button>
          </header>

          {/* Hero */}
          <main className="flex-grow max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-20">
            <div className="flex flex-col gap-6">
              <div className="tagline-badge">Now Active in Brooklyn, NY</div>
              <h1 className="font-extrabold text-4xl md:text-5xl leading-tight tracking-tight font-display">
                The Intelligent<br />Sustainability<br />Assistant
              </h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Continuous carbon tracking, explainable utility breakdowns, and proactive anomaly warnings. Optimize your environmental and financial footprint automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn btn-primary" style={{ height: '44px', fontSize: '14px' }} onClick={() => setView('onboarding')}>
                  Get Started Free →
                </button>
                <button className="btn btn-secondary" style={{ height: '44px', fontSize: '14px' }} onClick={() => {
                  setUser({ email: 'demo@aura.org', name: 'Demo User', zipCode: '11201', homeType: 'Apartment', baselineFootprint: 3600, currentScore: 84 });
                  setView('app');
                }}>
                  View Live Demo
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="widget-preview-card w-full max-w-sm">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-sm font-display">Live Carbon Grid Match</h3>
                  <div className="pulse-indicator clean"></div>
                </div>
                <div className="flex items-end gap-4 mb-3 flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono">180</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>g CO₂/kWh</span>
                  </div>
                  <div className="grid-badge">Grid 82% Clean (Wind Peak)</div>
                </div>
                <div className="mini-grid-bar mb-4">
                  <div className="bar-fill clean" style={{ width: '82%' }}></div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Running high-load appliances now saves 4.2 kg CO₂ vs coal peak hours.
                </p>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="font-bold text-lg font-display" style={{ color: 'var(--emerald)' }}>84</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>EcoScore</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg font-display" style={{ color: 'var(--blue)' }}>Top 8%</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Rank</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg font-display" style={{ color: 'var(--yellow)' }}>210kg</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Feature cards */}
          <section className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
            <div className="feat-card">
              <div className="text-2xl mb-3">⚡</div>
              <h4 className="font-semibold text-base mb-2 font-display">Grid-Aware Automation</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                Coordinate Smart Charging and Pre-Cooling schedules aligned with peak renewable energy generation windows.
              </p>
            </div>
            <div className="feat-card">
              <div className="text-2xl mb-3">🔍</div>
              <h4 className="font-semibold text-base mb-2 font-display">Explainable Analytics</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                No black-box scoring. Our model separates weather-driven consumption from behavioral metrics.
              </p>
            </div>
            <div className="feat-card">
              <div className="text-2xl mb-3">🚨</div>
              <h4 className="font-semibold text-base mb-2 font-display">Anomaly Warnings</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                AI scans utility patterns to flag leaks and insulation issues before they spike your billing cycles.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          2. GOOGLE LOGIN MODAL
          ═══════════════════════════════════════════ */}
      {loginModal && (
        <div className="modal-overlay active">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="font-bold text-sm font-display">Welcome to EcoSphere AI</h2>
              <button className="close-btn" onClick={() => setLoginModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="sub-label">Sign in with your Google account to sync ConEd utility streams, smart home devices, and local carbon benchmarks.</p>
              <button className="btn btn-google w-full" onClick={() => {
                setUser({ email: 'demo@aura.org', name: 'Demo User', zipCode: '11201', homeType: 'Apartment', baselineFootprint: 3400, currentScore: 84 });
                setLoginModal(false);
                setView('onboarding');
              }}>
                <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <div className="login-trust">
                <span>🛡️ 256-bit SSL</span>
                <span>🔒 GDPR Compliant</span>
                <span>✓ No spam</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          3. ONBOARDING VIEW
          ═══════════════════════════════════════════ */}
      {view === 'onboarding' && (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-obsidian)' }}>
          <div className="onboarding-card w-full" style={{ maxWidth: '520px' }}>
            <div className="onboarding-header">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--emerald)' }}></span>
                <h2 className="font-bold text-lg font-display">Configure Baseline Profile</h2>
              </div>
              <div className="step-indicator">Step {onbStep} of 3</div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '3px', backgroundColor: 'var(--bg-card)', margin: '0 -32px', marginTop: '0' }}>
              <div style={{ height: '100%', backgroundColor: 'var(--emerald)', width: `${(onbStep / 3) * 100}%`, transition: 'width 0.3s ease', borderRadius: '0 2px 2px 0' }}></div>
            </div>

            <div style={{ marginTop: '28px' }}>
              {onbStep === 1 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-semibold text-lg font-display mb-1">Where are you located?</h3>
                    <p className="section-desc">We use your postal code to query local grid mix intensity and compile peer comparison data.</p>
                  </div>
                  <div className="input-wrapper">
                    <label>Postal Code</label>
                    <input type="text" value={zipInput} onChange={(e) => setZipInput(e.target.value)} placeholder="e.g. 11201" maxLength={10} />
                    <span className="input-info">Currently serving Brooklyn and surrounding areas.</span>
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setOnbStep(2)}>Next Step →</button>
                </div>
              )}

              {onbStep === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-semibold text-lg font-display mb-1">Tell us about your home</h3>
                    <p className="section-desc">Establishing your structural carbon baseline prevents false alerts for larger households.</p>
                  </div>
                  <div className="option-grid">
                    {(['Apartment', 'Townhouse', 'Detached'] as const).map(type => (
                      <div key={type} className={`opt-card ${homeType === type ? 'active' : ''}`} onClick={() => setHomeType(type)}>
                        <h4>{type === 'Detached' ? 'Detached House' : type}</h4>
                        <p>{type === 'Apartment' ? 'Shared walls, efficient heating footprint.' : type === 'Townhouse' ? 'Multi-floor, moderate baseline load.' : 'Standalone, high heating/AC capacity.'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-secondary" onClick={() => setOnbStep(1)}>← Back</button>
                    <button className="btn btn-primary" onClick={() => setOnbStep(3)}>Next Step →</button>
                  </div>
                </div>
              )}

              {onbStep === 3 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-semibold text-lg font-display mb-1">Your commuter footprint</h3>
                    <p className="section-desc">Adjust the sliders to estimate your average daily transportation values.</p>
                  </div>
                  <div className="slider-wrapper" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                    <div className="slider-labels">
                      <label>Gasoline Commute</label>
                      <span className="value-display">{gasCommute} mi/day</span>
                    </div>
                    <input type="range" min="0" max="60" value={gasCommute} className="range-slider" onChange={(e) => setGasCommute(parseInt(e.target.value))} />
                  </div>
                  <div className="slider-wrapper" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                    <div className="slider-labels">
                      <label>EV / Transit Commute</label>
                      <span className="value-display">{transitCommute} mi/day</span>
                    </div>
                    <input type="range" min="0" max="60" value={transitCommute} className="range-slider" onChange={(e) => setTransitCommute(parseInt(e.target.value))} />
                  </div>
                  <div className="checkbox-wrapper" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                    <input type="checkbox" id="auto-meter-chk" checked={autoMeter} onChange={(e) => setAutoMeter(e.target.checked)} />
                    <label htmlFor="auto-meter-chk">Enable auto-utility readings from smart plugs (Nest, ConEd sync)</label>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-secondary" onClick={() => setOnbStep(2)}>← Back</button>
                    <button className="btn btn-primary" onClick={handleOnboardingSubmit} disabled={onbLoading}>
                      {onbLoading ? 'Setting up...' : 'Complete Setup & Launch →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          4. MAIN APPLICATION SHELL
          ═══════════════════════════════════════════ */}
      {view === 'app' && (
        <div className="flex flex-col md:flex-row" style={{ minHeight: '100vh' }}>

          {/* Sidebar */}
          <aside className="app-sidebar" style={{ width: '100%', flexShrink: 0 }}
            data-md-width="240px">
            <style>{`@media(min-width:768px){aside.app-sidebar{width:240px}}`}</style>
            <div className="sidebar-brand">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }}></span>
              <span className="font-semibold font-display">EcoSphere AI</span>
            </div>

            <nav className="sidebar-nav">
              {[
                { id: 'dash', label: 'Dashboard', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
                { id: 'weekly-log', label: 'Weekly Log', icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
                { id: 'simulator', label: 'Simulator', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
                { id: 'coach', label: 'AI Coach', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z' }
              ].map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${tab === item.id ? 'active' : ''}`}
                  onClick={() => handleTabSwitch(item.id as 'dash' | 'weekly-log' | 'simulator' | 'coach')}
                >
                  <svg style={{ width: '17px', height: '17px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </div>
              ))}
            </nav>

            {/* Integration status — hidden on mobile */}
            <div className="hidden md:flex flex-col gap-3 m-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Integrations</p>
              {[
                { name: 'Nest Thermostat', color: 'var(--emerald)' },
                { name: 'ConEd Smart Meter', color: 'var(--emerald)' },
                { name: 'Tesla Connector', color: 'var(--yellow)' }
              ].map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }}></span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.name}</span>
                </div>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 p-4 m-0" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {(user?.name || 'DU').split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span style={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Demo User'}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'demo@aura.org'}</span>
              </div>
            </div>
          </aside>

          {/* Main workspace */}
          <main className="app-workspace">

            {/* Top header */}
            <header className="app-header">
              {/* Search / AI quick-input */}
              <div className="flex items-center gap-2 rounded-md px-3"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', height: '36px', minWidth: '180px', maxWidth: '260px', flex: 1, cursor: 'pointer' }}
                onClick={() => handleTabSwitch('coach')}>
                <svg style={{ width: '14px', height: '14px', fill: 'var(--text-muted)', flexShrink: 0 }} viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ask AI Coach...</span>
              </div>

              {/* Live Grid Widget */}
              <div className="flex items-center gap-2 px-3 rounded-md cursor-pointer flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', height: '36px' }}
                onClick={handleGridToggle}
                title="Click to simulate grid state change">
                <div className={`live-circle-indicator ${gridCleanState ? 'green' : 'amber'}`}></div>
                <div className="hidden sm:flex flex-col">
                  <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{gridCleanState ? 'Grid Clean' : 'Grid Dirty'}</span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{gridCleanState ? '180' : '640'} g CO₂/kWh</span>
                </div>
              </div>

              {/* Notification bell */}
              <div className="relative cursor-pointer" onClick={() => triggerAnomalySweep().then(setAnomaly).catch(() => {})}>
                <svg style={{ width: '20px', height: '20px', fill: 'var(--text-secondary)' }} viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                {anomaly && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', backgroundColor: 'var(--coral)', fontSize: '8px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>1</span>
                )}
              </div>
            </header>

            {/* Scrollable content */}
            <div className="workspace-scrollable">

              {/* ─── TAB: DASHBOARD ─── */}
              {tab === 'dash' && (
                <div className="flex flex-col gap-5">

                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* EcoSphere Score */}
                    <div className="metrics-card">
                      <div className="flex justify-between items-center" style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
                        <span>EcoSphere Score</span>
                        <span className="grade-tag">{scoreGrade()}</span>
                      </div>
                      <div className="flex items-baseline gap-1" style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'var(--font-display)' }}>{user?.currentScore ?? 84}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div style={{ height: '100%', backgroundColor: 'var(--emerald)', width: `${user?.currentScore ?? 84}%`, transition: 'width 0.5s ease' }}></div>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Based on local grid match.</span>
                    </div>

                    {/* Weekly Trend */}
                    <div className="metrics-card">
                      <div className="flex justify-between items-center" style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
                        <span>Weekly Trend</span>
                        <span style={{ color: 'var(--emerald)', fontWeight: 600, fontSize: '11px' }}>+4.2%</span>
                      </div>
                      <div className="flex items-baseline gap-1.5" style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>210 kg</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>CO₂ Saved</span>
                      </div>
                      <svg style={{ width: '100%', height: '28px', marginBottom: '4px' }} viewBox="0 0 100 30">
                        <path d="M0,25 Q15,10 30,22 T60,8 T90,20 T100,5" fill="none" stroke="var(--emerald)" strokeWidth="2" />
                        <circle cx="100" cy="5" r="2.5" fill="var(--emerald)" />
                      </svg>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>vs last week efficiency.</span>
                    </div>

                    {/* Peer Benchmark */}
                    <div className="metrics-card">
                      <div className="flex justify-between items-center" style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
                        <span>Peer Benchmark</span>
                        <span className="rank-tag">Top 8%</span>
                      </div>
                      <div className="flex items-baseline gap-1.5" style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>12%</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Cleaner</span>
                      </div>
                      <div className="flex justify-between" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>You ●</span><span>● Avg</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', position: 'relative', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', top: '-2px', left: '60%', border: '2px solid var(--bg-obsidian)' }}></span>
                        <span style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)', top: '-2px', left: '38%', border: '2px solid var(--bg-obsidian)' }}></span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Zip {user?.zipCode ?? '11201'} households.</span>
                    </div>

                    {/* Grid Sync */}
                    <div className="metrics-card">
                      <div className="flex justify-between items-center" style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
                        <span>Grid Match</span>
                        <span className="status-capsule active">{gridCleanState ? '80% Peak' : '15% Peak'}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5" style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gridCleanState ? '3.2 Hrs' : '0.4 Hrs'}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Clean Sync</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                        <div style={{ height: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: 'var(--emerald)', width: gridCleanState ? '85%' : '15%', transition: 'width 0.5s ease' }}></div>
                        </div>
                        <div style={{ height: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: 'var(--blue)', width: '60%' }}></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Shifted to clean hours.</span>
                    </div>
                  </div>

                  {/* Anomaly Alert Banner */}
                  {anomaly && (
                    <div className="anomaly-alert-banner show flex-col sm:flex-row gap-4">
                      <div className="flex gap-3 items-start">
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
                        <div>
                          <strong style={{ color: 'var(--coral)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '2px' }}>AI Anomaly Detected (June 8)</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Unusual electricity usage spike (+115%) detected between 2:00 PM and 5:00 PM.</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="btn-alert-action" onClick={handleDiagnoseAnomaly}>Diagnose with AI</button>
                        <button className="btn-alert-secondary" onClick={handleDismissAnomaly}>Dismiss</button>
                      </div>
                    </div>
                  )}

                  {/* Charts grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Carbon Breakdown Chart */}
                    <div className="main-chart-card">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h3 className="font-semibold font-display" style={{ fontSize: '15px' }}>Carbon Breakdown</h3>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Categorized emissions & meteorological factors</p>
                        </div>
                        <div className="chart-toggles">
                          <span className="chart-toggle-pill active">This Month</span>
                          <span className="chart-toggle-pill">Last Month</span>
                        </div>
                      </div>

                      <svg style={{ width: '100%', height: '180px' }} viewBox="0 0 500 200">
                        <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeDasharray="4" />
                        <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border-color)" strokeDasharray="4" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeDasharray="4" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-color)" />
                        <text x="5" y="24" fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)">300kg</text>
                        <text x="5" y="74" fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)">200kg</text>
                        <text x="5" y="124" fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)">100kg</text>
                        <text x="10" y="174" fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)">0kg</text>
                        {/* Week bars */}
                        {[
                          { x: 70, h1: 40, h2: 50, h3: 20 },
                          { x: 170, h1: 30, h2: 45, h3: 20 },
                          { x: 270, h1: 35, h2: 55, h3: 25 },
                          { x: 370, h1: anomaly ? 75 : 45, h2: 40, h3: 25 }
                        ].map((bar, i) => (
                          <g key={i}>
                            <rect x={bar.x} y={170 - bar.h1 - bar.h2 - bar.h3} width="28" height={bar.h1} fill="var(--emerald)" rx="2" style={{ transition: 'all 0.3s' }} />
                            <rect x={bar.x} y={170 - bar.h2 - bar.h3} width="28" height={bar.h2} fill="var(--blue)" rx="2" />
                            <rect x={bar.x} y={170 - bar.h3} width="28" height={bar.h3} fill="var(--coral)" rx="2" />
                            <text x={bar.x + 4} y="190" fill="var(--text-muted)" fontSize="9">Wk {i + 1}</text>
                          </g>
                        ))}
                      </svg>

                      <div className="flex gap-4 flex-wrap" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        <span className="flex items-center gap-1.5"><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald)', display: 'inline-block' }}></span>Electricity</span>
                        <span className="flex items-center gap-1.5"><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--blue)', display: 'inline-block' }}></span>Transport</span>
                        <span className="flex items-center gap-1.5"><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--coral)', display: 'inline-block' }}></span>Waste & Diet</span>
                      </div>
                    </div>

                    {/* Explainable AI Card */}
                    <div className="explainable-ai-card flex flex-col gap-4">
                      <h3 className="font-semibold font-display" style={{ fontSize: '15px' }}>Explainable AI Summary</h3>

                      <div className="flex gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--emerald)', color: 'var(--bg-obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>AI</div>
                        <div>
                          <p style={{ fontSize: '12.5px', lineHeight: '1.7', margin: 0 }}>
                            {anomaly
                              ? '"Your electricity carbon spiked on Week 4. Environmental model cross-referencing indicates this was 100% caused by AC override cycles running during a local 92°F heatwave event."'
                              : '"Your carbon footprint fell 14% this month. Meteorological model parsing shows 80% was due to cooler temperatures reducing AC grid loads, and 20% from active grid-shifting of washing cycles to solar generation hours."'}
                          </p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>Confidence Index: 98.4% — ConEd weather correlation model</p>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '10px' }}>Suggested Interventions</h4>
                        {[
                          { label: 'Pre-Cool home tomorrow 10am–1pm', tag: 'Nest', tagColor: 'blue', btn: 'Enable', action: () => { if (user) setUser({ ...user, currentScore: Math.min(100, user.currentScore + 2) }); } },
                          { label: 'Limit EV charging to wind windows', tag: 'Tesla', tagColor: 'yellow', btn: 'Sync', action: () => { if (user) setUser({ ...user, currentScore: Math.min(100, user.currentScore + 3) }); } }
                        ].map((item, i) => (
                          <div key={i} onClick={item.action} className="flex justify-between items-center rounded-md p-3 cursor-pointer"
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '8px', transition: 'border-color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--emerald)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                            <div className="flex items-center gap-2.5" style={{ fontSize: '12.5px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', backgroundColor: item.tagColor === 'blue' ? 'rgba(6,182,212,0.15)' : 'rgba(234,179,8,0.15)', color: item.tagColor === 'blue' ? 'var(--blue)' : 'var(--yellow)' }}>{item.tag}</span>
                              <span>{item.label}</span>
                            </div>
                            <button className="btn btn-sm btn-primary">{item.btn}</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB: WEEKLY LOG ─── */}
              {tab === 'weekly-log' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="logging-card-left flex flex-col gap-5">
                    <div>
                      <h3 className="font-semibold font-display" style={{ fontSize: '15px' }}>Submit Weekly Sustainability Log</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Complete the report for Week 24 (June 8–14) to recalculate your EcoSphere Score.</p>
                    </div>

                    <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      {(['energy', 'transport'] as const).map(cat => (
                        <span key={cat} className={`log-tab-pill ${logCat === cat ? 'active' : ''}`} onClick={() => setLogCat(cat)}>
                          {cat === 'energy' ? '⚡ Energy' : '🚗 Transport'}
                        </span>
                      ))}
                    </div>

                    {logCat === 'energy' && (
                      <div className="flex flex-col gap-4">
                        <div className="checkbox-wrapper p-3 rounded-md" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                          <input type="checkbox" id="log-auto" checked={logEnergyAuto} onChange={(e) => setLogEnergyAuto(e.target.checked)} />
                          <label htmlFor="log-auto">Auto-import electricity from ConEd API (Recommended)</label>
                        </div>
                        {!logEnergyAuto && (
                          <div className="input-wrapper">
                            <label>Manual Electricity (kWh)</label>
                            <input type="number" value={inputKwh} onChange={(e) => setInputKwh(parseInt(e.target.value) || 0)} />
                          </div>
                        )}
                        <div className="slider-wrapper">
                          <div className="slider-labels">
                            <label>Household Gas Consumption</label>
                            <span className="value-display">{inputGas} Therms</span>
                          </div>
                          <input type="range" min="0" max="50" value={inputGas} className="range-slider" onChange={(e) => setInputGas(parseInt(e.target.value))} />
                        </div>
                        <div className="slider-wrapper">
                          <div className="slider-labels">
                            <label>Refrigeration Active Hours</label>
                            <span className="value-display">{inputRef} Hours</span>
                          </div>
                          <input type="range" min="0" max="168" value={inputRef} className="range-slider" onChange={(e) => setInputRef(parseInt(e.target.value))} />
                        </div>
                      </div>
                    )}

                    {logCat === 'transport' && (
                      <div className="flex flex-col gap-4">
                        <div className="slider-wrapper">
                          <div className="slider-labels">
                            <label>Gas Car Miles This Week</label>
                            <span className="value-display">{inputCar} mi</span>
                          </div>
                          <input type="range" min="0" max="500" value={inputCar} className="range-slider" onChange={(e) => setInputCar(parseInt(e.target.value))} />
                        </div>
                        <div className="slider-wrapper">
                          <div className="slider-labels">
                            <label>EV / Transit Miles</label>
                            <span className="value-display">{inputEv} mi</span>
                          </div>
                          <input type="range" min="0" max="500" value={inputEv} className="range-slider" onChange={(e) => setInputEv(parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Food Profile</label>
                          <div className="flex gap-2 flex-wrap">
                            {['Low Impact', 'Mixed Diet', 'High Impact'].map(fp => (
                              <span key={fp} onClick={() => setFoodProfile(fp)}
                                style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '100px', border: `1px solid ${foodProfile === fp ? 'var(--emerald)' : 'var(--border-color)'}`, color: foodProfile === fp ? 'var(--emerald)' : 'var(--text-secondary)', backgroundColor: foodProfile === fp ? 'var(--emerald-glow)' : 'var(--bg-card)', cursor: 'pointer', transition: 'all 0.15s' }}>
                                {fp}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="checkbox-wrapper pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <input type="checkbox" id="chk-compost" checked={chkCompost} onChange={(e) => setChkCompost(e.target.checked)} />
                          <label htmlFor="chk-compost">Composted 100% of organic kitchen waste this week (+5 EcoPoints)</label>
                        </div>
                      </div>
                    )}

                    <button
                      className="btn btn-primary w-full"
                      style={{ marginTop: '8px', height: '42px' }}
                      onClick={handleLogSubmit}
                      disabled={logSubmitting}
                    >
                      {logSuccess ? '✓ Score Updated!' : logSubmitting ? 'Saving...' : 'Save Log & Recalculate Score'}
                    </button>
                  </div>

                  <div className="logging-card-right">
                    <h3 className="font-semibold font-display" style={{ fontSize: '15px', marginBottom: '16px' }}>Logging History Ledger</h3>
                    <div className="flex flex-col gap-3">
                      {logsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                          <span style={{ fontSize: '32px' }}>📋</span>
                          <p style={{ fontSize: '13px' }}>No logged weeks yet.<br />Submit a log to populate your history.</p>
                        </div>
                      ) : (
                        logsList.map((l, i) => (
                          <div key={i} className="ledger-item">
                            <div style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '3px' }}>Week {l.weekNumber}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                              {l.electricityKwh} kWh · {l.gasTherms} Therms · {l.carMiles} mi gas / {l.evMiles} mi EV · Compost [{l.composted ? '✓' : ' '}]
                            </div>
                            <span style={{ position: 'absolute', right: '12px', top: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--emerald)' }}>+110 XP</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB: WHAT-IF SIMULATOR ─── */}
              {tab === 'simulator' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="sim-controls flex flex-col gap-5">
                    <div>
                      <h3 className="font-semibold font-display" style={{ fontSize: '15px' }}>Lifestyle Sandbox Sliders</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Adjust habits to visualize your projected 10-year environmental outcomes.</p>
                    </div>

                    {[
                      { key: 'temp' as const, label: 'Home Thermostat Schedule', min: 65, max: 80, val: sim.temp, unit: '°F', hint: 'Higher temps reduce AC peak strain and grid dependency.' },
                      { key: 'charge' as const, label: 'EV Charging Grid Sync', min: 0, max: 100, val: sim.charge, unit: '% Clean Match', hint: 'Align battery charging to solar/wind generation peaks.' },
                      { key: 'compost' as const, label: 'Organic Waste Composting', min: 0, max: 100, val: sim.compost, unit: '% Recycled', hint: 'Composting prevents landfill methane decay emissions.' }
                    ].map(slider => (
                      <div key={slider.key} className="card-bg p-4">
                        <div className="slider-labels">
                          <label>{slider.label}</label>
                          <span className="value-display">{slider.val} {slider.unit}</span>
                        </div>
                        <input type="range" min={slider.min} max={slider.max} value={slider.val}
                          className="range-slider" style={{ marginTop: '10px', marginBottom: '8px' }}
                          onChange={(e) => updateSim(slider.key, parseInt(e.target.value))} />
                        <p className="slider-hint">{slider.hint}</p>
                      </div>
                    ))}

                    <button className="btn btn-primary w-full" style={{ height: '42px' }} onClick={handleOpenLinkedIn}>
                      📤 Generate LinkedIn Impact Post
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="sim-mini-card">
                        <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>10-Year Carbon Footprint</h4>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'var(--font-display)' }}>{projectedCO2.toFixed(1)}<span style={{ fontSize: '14px' }}> t</span></div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--emerald)', marginTop: '4px' }}>↓ {pctSaved}% vs baseline</p>
                      </div>
                      <div className="sim-mini-card">
                        <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Projected Cost Savings</h4>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'var(--font-display)' }}>${cashSavings.toLocaleString()}<span style={{ fontSize: '14px' }}>/yr</span></div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Eligible for NYC rebates</p>
                      </div>
                    </div>

                    <div className="sim-chart-container">
                      <h4 className="font-semibold font-display" style={{ fontSize: '14px', marginBottom: '12px' }}>10-Year Cumulative Carbon Curve</h4>
                      <svg style={{ width: '100%', height: '160px' }} viewBox="0 0 500 200">
                        <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeDasharray="4" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-color)" />
                        <text x="5" y="24" fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)">120t</text>
                        <text x="10" y="174" fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--font-mono)">0t</text>
                        <path d="M40,170 L128,140 L216,110 L304,80 L392,50 L480,20" fill="none" stroke="var(--text-muted)" strokeDasharray="5" strokeWidth="1.5" />
                        <text x="400" y="35" fill="var(--text-muted)" fontSize="8.5">Status Quo</text>
                        <path d={curveD} fill="none" stroke="var(--emerald)" strokeWidth="2.5" style={{ transition: 'd 0.3s ease' }} />
                        <text x="400" y="80" fill="var(--emerald)" fontSize="8.5" fontWeight="bold">With EcoSphere</text>
                        {['Yr 0', 'Yr 2', 'Yr 4', 'Yr 6', 'Yr 8', 'Yr 10'].map((label, i) => (
                          <text key={label} x={40 + i * 88} y="192" fill="var(--text-muted)" fontSize="8.5">{label}</text>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB: AI COACH ─── */}
              {tab === 'coach' && (
                <div className="coach-container" style={{ height: 'calc(100vh - 136px)', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
                  <style>{`@media(min-width:768px){.coach-inner{grid-template-columns:260px 1fr!important}}`}</style>
                  <div className="coach-inner" style={{ display: 'grid', gridTemplateColumns: '1fr', height: '100%', overflow: 'hidden' }}>
                    {/* Coach sidebar */}
                    <div className="coach-sidebar hidden md:flex flex-col gap-4 p-5 overflow-y-auto">
                      <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Audits</h3>
                      {anomaly ? (
                        <div className="audit-item active" onClick={() => handleChatSend('Why did my energy usage spike on June 8th?')}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', backgroundColor: 'rgba(249,115,22,0.15)', color: 'var(--coral)', display: 'inline-block', marginBottom: '6px' }}>Critical</span>
                          <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Electricity Spike</h4>
                          <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>June 8 · +115% deviation</p>
                        </div>
                      ) : (
                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                          No active anomalies. All systems green.
                        </div>
                      )}
                      <div className="coach-bio" style={{ marginTop: 'auto' }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>AI Coach Intelligence</strong>
                        <p>Powered by Google Gemini 2.5 Flash with custom sustainability prompt wrappers.</p>
                      </div>
                    </div>

                    {/* Chat area */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                      <div className="chat-header">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--emerald)', color: 'var(--bg-obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>AI</div>
                        <div>
                          <strong style={{ fontSize: '13.5px', display: 'block' }}>EcoSphere AI Coach</strong>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gemini 2.5 Flash · Contextual Memory Active</span>
                        </div>
                      </div>

                      <div ref={chatBoxRef} className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                        {chat.map((c, i) => (
                          <div key={i} className={`chat-msg ${c.role === 'model' ? 'coach' : 'user'}`}>
                            <p dangerouslySetInnerHTML={{ __html: c.text.replace(/\n/g, '<br/>') }}></p>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="chat-msg coach">
                            <p style={{ animation: 'blink 1s ease-in-out infinite' }}>Thinking...</p>
                          </div>
                        )}
                      </div>

                      <div className="chat-chips-row">
                        {[
                          'Explain June 8 Anomaly',
                          'AC Optimization Tips',
                          'Compare My Benchmarks',
                          'Best grid-shift windows today?'
                        ].map(chip => (
                          <span key={chip} className="chat-chip" onClick={() => handleChatSend(chip)}>{chip}</span>
                        ))}
                      </div>

                      <div className="chat-input-wrapper">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !chatLoading && handleChatSend()}
                          placeholder="Ask your AI Coach a question..."
                          disabled={chatLoading}
                        />
                        <button className="btn btn-primary" style={{ height: '40px', padding: '0 20px' }} onClick={() => handleChatSend()} disabled={chatLoading}>
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          5. LINKEDIN GENERATOR MODAL
          ═══════════════════════════════════════════ */}
      {linkedinModal && (
        <div className="modal-overlay active">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="font-bold text-sm font-display">LinkedIn Impact Generator</h2>
              <button className="close-btn" onClick={() => setLinkedinModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="sub-label">Share your simulated sustainability path with your professional network.</p>
              <div className="tone-selectors">
                {([['professional', '💼 Professional'], ['celebratory', '🎉 Celebratory'], ['analytical', '📊 Analytical']] as const).map(([tone, label]) => (
                  <span key={tone} className={`tone-pill ${linkedinTone === tone ? 'active' : ''}`} onClick={() => handleToneChange(tone)}>{label}</span>
                ))}
              </div>
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px' }}>
                <textarea
                  style={{ width: '100%', height: '160px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '12.5px', resize: 'none', outline: 'none', lineHeight: '1.7', fontFamily: 'var(--font-body)' }}
                  value={linkedinText}
                  onChange={(e) => setLinkedinText(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={() => setLinkedinModal(false)}>Close</button>
                <button className="btn btn-primary" onClick={copyToClipboard}>{copyStatus}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
