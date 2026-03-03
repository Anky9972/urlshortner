import { useState, useRef, useCallback, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import QRCodeLib from 'qrcode';
import JSZip from 'jszip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import {
  Link, Mail, Smartphone, Map, Wifi, Calendar, FileText, Download,
  AlertCircle, QrCode, Copy, Check, User, History, Trash2,
  Layers, Eye, Palette, FileDown, Sparkles, LayoutTemplate, Upload, Package, Zap, Edit2, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { SEOMetadata } from '@/components/seo-metadata';
import { getToken } from '@/api/token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const QR_HISTORY_KEY = 'trimlink_qr_history';
const MAX_HISTORY = 8;

const FRAME_STYLES = [
  { value: 'none',     label: 'None' },
  { value: 'scan-me',  label: 'Scan Me' },
  { value: 'border',   label: 'Border' },
  { value: 'corner',   label: 'Corners' },
];

const GRADIENT_ANGLES = [
  { value: 0,   label: '↑' },
  { value: 90,  label: '→' },
  { value: 135, label: '↘' },
  { value: 180, label: '↓' },
];

const DOT_STYLES = [
  { value: 'squares', label: 'Squares' },
  { value: 'dots', label: 'Dots' },
  { value: 'fluid', label: 'Fluid' },
];

const EYE_RADIUS_PRESETS = [
  { label: 'Square', value: 0 },
  { label: 'Rounded', value: 8 },
  { label: 'Circle', value: 50 },
];

const EC_LEVELS = [
  { value: 'L', label: 'L – Low (7%)' },
  { value: 'M', label: 'M – Medium (15%)' },
  { value: 'Q', label: 'Q – Quartile (25%)' },
  { value: 'H', label: 'H – High (30%)' },
];

const QRCodeGenerator = () => {
  const qrId = 'trimlink-qr-preview';

  // Content state
  const [qrType, setQrType] = useState('url');
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState('');

  // vCard fields
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  // Style state
  const [size, setSize] = useState(240);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState(null);
  const [qrStyle, setQrStyle] = useState('squares');
  const [eyeRadius, setEyeRadius] = useState(0);
  const [eyeColor, setEyeColor] = useState('#000000');
  const [ecLevel, setEcLevel] = useState('Q');

  // Gradient state
  const [useGradient, setUseGradient] = useState(false);
  const [gradientFrom, setGradientFrom] = useState('#4f46e5');
  const [gradientTo, setGradientTo] = useState('#ec4899');
  const [gradientAngle, setGradientAngle] = useState(135);

  // Frame state
  const [frameStyle, setFrameStyle] = useState('none');
  const [frameText, setFrameText] = useState('Scan Me');

  // Bulk QR state
  const [bulkCsv, setBulkCsv] = useState('');
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const bulkFileRef = useRef(null);

  // Dynamic QR state
  const [dynList, setDynList] = useState([]);
  const [dynLoading, setDynLoading] = useState(false);
  const [dynForm, setDynForm] = useState({ title: '', targetUrl: '' });
  const [dynEditing, setDynEditing] = useState(null); // id being edited
  const [dynEditUrl, setDynEditUrl] = useState('');

  const dynHeaders = () => {
    const token = getToken();
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const loadDynQrs = async () => {
    setDynLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dynamic-qr`, { credentials: 'include', headers: dynHeaders() });
      if (res.ok) setDynList(await res.json());
    } catch { /* ignore */ } finally { setDynLoading(false); }
  };

  const createDynQr = async () => {
    if (!dynForm.targetUrl) return toast.error('Target URL is required');
    const res = await fetch(`${API_URL}/api/dynamic-qr`, {
      method: 'POST', credentials: 'include', headers: dynHeaders(),
      body: JSON.stringify(dynForm),
    });
    if (res.ok) { toast.success('Dynamic QR created!'); setDynForm({ title: '', targetUrl: '' }); loadDynQrs(); }
    else { const d = await res.json(); toast.error(d.error || 'Failed'); }
  };

  const updateDynQr = async (id) => {
    if (!dynEditUrl) return;
    const res = await fetch(`${API_URL}/api/dynamic-qr/${id}`, {
      method: 'PUT', credentials: 'include', headers: dynHeaders(),
      body: JSON.stringify({ targetUrl: dynEditUrl }),
    });
    if (res.ok) { toast.success('Updated!'); setDynEditing(null); loadDynQrs(); }
    else { const d = await res.json(); toast.error(d.error || 'Failed'); }
  };

  const deleteDynQr = async (id) => {
    if (!confirm('Delete this dynamic QR?')) return;
    const res = await fetch(`${API_URL}/api/dynamic-qr/${id}`, {
      method: 'DELETE', credentials: 'include', headers: dynHeaders(),
    });
    if (res.ok) { toast.success('Deleted'); loadDynQrs(); }
  };

  // UI state
  const [copied, setCopied] = useState(false);
  const [activePanel, setActivePanel] = useState('content');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(QR_HISTORY_KEY) || '[]');
      setHistory(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (getToken()) loadDynQrs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToHistory = useCallback((value, type) => {
    const entry = { id: Date.now(), type, value, fgColor, bgColor, qrStyle, createdAt: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    try { localStorage.setItem(QR_HISTORY_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, [history, fgColor, bgColor, qrStyle]);

  const qrTypes = {
    url:      { label: 'URL',      icon: Link,      placeholder: 'https://example.com',   validate: (v) => /^https?:\/\/.+/.test(v) ? '' : 'Enter a valid URL (https://...)' },
    email:    { label: 'Email',    icon: Mail,      placeholder: 'email@example.com',      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email' },
    phone:    { label: 'Phone',    icon: Smartphone, placeholder: '+1 234 567 8900',       validate: (v) => /^\+?[\d\s\-().]{7,}$/.test(v) ? '' : 'Enter a valid phone number' },
    vcard:    { label: 'vCard',    icon: User,      placeholder: '',                       validate: () => vcardName ? '' : 'Name is required for vCard' },
    wifi:     { label: 'WiFi',     icon: Wifi,      placeholder: 'SSID,Password',          validate: (v) => v.includes(',') ? '' : 'Format: SSID,Password' },
    location: { label: 'Location', icon: Map,       placeholder: '40.7128,-74.0060',       validate: (v) => { const [a,b]=v.split(',').map(parseFloat); return(a>=-90&&a<=90&&b>=-180&&b<=180)?'':'Format: lat,lng'; } },
    event:    { label: 'Event',    icon: Calendar,  placeholder: 'Event name or details',  validate: (v) => v.trim() ? '' : 'Enter event details' },
    text:     { label: 'Text',     icon: FileText,  placeholder: 'Any text…',              validate: (v) => v.trim() ? '' : 'Enter some text' },
  };

  const buildQRValue = () => {
    switch (qrType) {
      case 'email':   return `mailto:${qrData}`;
      case 'phone':   return `tel:${qrData.replace(/\s/g,'')}`;
      case 'wifi':    { const [s,...r]=qrData.split(','); return `WIFI:S:${s.trim()};T:WPA;P:${r.join(',').trim()};;`; }
      case 'location':{ const [a,b]=qrData.split(','); return `geo:${a.trim()},${b.trim()}`; }
      case 'event':   return `BEGIN:VEVENT\nSUMMARY:${qrData}\nEND:VEVENT`;
      case 'vcard':   return ['BEGIN:VCARD','VERSION:3.0', vcardName?`FN:${vcardName}`:'', vcardPhone?`TEL:${vcardPhone}`:'', vcardEmail?`EMAIL:${vcardEmail}`:'', vcardOrg?`ORG:${vcardOrg}`:'', vcardUrl?`URL:${vcardUrl}`:'', 'END:VCARD'].filter(Boolean).join('\n');
      default:        return qrData;
    }
  };

  const effectiveValue = qrType === 'vcard' ? buildQRValue() : (qrData ? buildQRValue() : '');
  const isValid = !error && (qrType === 'vcard' ? !!vcardName : !!qrData);

  const handleDataChange = (val) => {
    setQrData(val);
    setError(val ? qrTypes[qrType].validate(val) : '');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { toast.error('Logo must be < 500 KB'); return; }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const downloadPNG = () => {
    const canvas = document.querySelector(`#${qrId} canvas`);
    if (!canvas) return;
    // If no effects, direct download
    if (!useGradient && frameStyle === 'none') {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qrcode-${qrType}-${Date.now()}.png`;
      link.click();
      saveToHistory(effectiveValue, qrType);
      toast.success('PNG downloaded!');
      return;
    }
    // Off-screen canvas for gradient/frame
    const framePad = frameStyle !== 'none' ? 32 : 0;
    const frameBottom = frameStyle !== 'none' ? 56 : 0;
    const off = document.createElement('canvas');
    off.width  = canvas.width  + framePad * 2;
    off.height = canvas.height + framePad * 2 + frameBottom;
    const ctx = off.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(canvas, framePad, framePad);
    if (useGradient) {
      // angle in degrees to x1/y1/x2/y2
      const rad = (gradientAngle * Math.PI) / 180;
      const x1 = 0.5 - 0.5 * Math.cos(rad); const y1 = 0.5 - 0.5 * Math.sin(rad);
      const x2 = 0.5 + 0.5 * Math.cos(rad); const y2 = 0.5 + 0.5 * Math.sin(rad);
      const grad = ctx.createLinearGradient(x1 * off.width, y1 * off.height, x2 * off.width, y2 * off.height);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = grad;
      ctx.fillRect(framePad, framePad, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (frameStyle !== 'none') {
      ctx.fillStyle = fgColor;
      ctx.font = `bold ${Math.round(off.width * 0.065)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(frameText, off.width / 2, canvas.height + framePad + 40);
    }
    const link = document.createElement('a');
    link.href = off.toDataURL('image/png');
    link.download = `qrcode-${qrType}-${Date.now()}.png`;
    link.click();
    saveToHistory(effectiveValue, qrType);
    toast.success('PNG downloaded!');
  };

  const downloadSVG = async () => {
    if (!effectiveValue) return;
    try {
      const svg = await QRCodeLib.toString(effectiveValue, { type: 'svg', color: { dark: fgColor, light: bgColor }, errorCorrectionLevel: ecLevel, width: size, margin: 1 });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `qrcode-${qrType}-${Date.now()}.svg`; link.click();
      URL.revokeObjectURL(url);
      saveToHistory(effectiveValue, qrType);
      toast.success('SVG downloaded!');
    } catch { toast.error('SVG generation failed'); }
  };

  const downloadPDF = async () => {
    if (!isValid) return;
    const canvas = document.querySelector(`#${qrId} canvas`);
    if (!canvas) return;
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const qrMM = 80;
      const marginX = (210 - qrMM) / 2;
      const imgData = canvas.toDataURL('image/png');
      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'PNG', marginX, 60, qrMM, qrMM);
      if (frameStyle !== 'none') {
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text(frameText, 105, 60 + qrMM + 14, { align: 'center' });
      }
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Generated by TrimLink — ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
      pdf.save(`qrcode-${qrType}-${Date.now()}.pdf`);
      saveToHistory(effectiveValue, qrType);
      toast.success('PDF downloaded!');
    } catch (err) { console.error(err); toast.error('PDF generation failed'); }
  };

  const copyToClipboard = async () => {
    const canvas = document.querySelector(`#${qrId} canvas`);
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      });
    } catch { toast.error('Copy failed – try download instead'); }
  };

  const loadFromHistory = (entry) => {
    setQrData(entry.value); setFgColor(entry.fgColor); setBgColor(entry.bgColor); setQrStyle(entry.qrStyle);
    toast.success('Loaded from history');
  };

  const clearHistory = () => {
    setHistory([]); localStorage.removeItem(QR_HISTORY_KEY); toast.success('History cleared');
  };

  const parseBulkCsv = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    return lines.map((line, i) => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const url = cols[0] || '';
      const label = cols[1] || `QR_${i + 1}`;
      return { url, label };
    }).filter(r => r.url);
  };

  const handleBulkFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBulkCsv(ev.target.result);
      setBulkItems(parseBulkCsv(ev.target.result));
    };
    reader.readAsText(file);
  };

  const handleBulkCsvChange = (text) => {
    setBulkCsv(text);
    setBulkItems(parseBulkCsv(text));
  };

  const generateBulkZip = async () => {
    if (bulkItems.length === 0) return;
    setBulkGenerating(true);
    setBulkProgress(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < bulkItems.length; i++) {
        const { url, label } = bulkItems[i];
        const dataUrl = await QRCodeLib.toDataURL(url, {
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'Q',
          width: 300,
          margin: 1,
        });
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(`${label.replace(/[^a-z0-9_-]/gi, '_')}.png`, base64, { base64: true });
        setBulkProgress(Math.round(((i + 1) / bulkItems.length) * 100));
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `trimlink-qrcodes-${Date.now()}.zip`;
      link.click();
      toast.success(`Generated ${bulkItems.length} QR codes!`);
    } catch (err) {
      toast.error('Failed to generate ZIP');
    } finally {
      setBulkGenerating(false);
      setBulkProgress(0);
    }
  };

  const panels = [
    { id: 'content', icon: FileText, label: 'Content' },
    { id: 'style',   icon: Palette,  label: 'Style' },
    { id: 'history', icon: History,  label: `History${history.length ? ` (${history.length})` : ''}` },
    { id: 'bulk',    icon: Package,  label: 'Bulk' },
    { id: 'dynamic', icon: Zap,      label: 'Dynamic' },
  ];

  return (
    <>
      <SEOMetadata
        title="Free QR Code Generator – Custom QR Codes | TrimLink"
        description="Generate custom QR codes for URLs, vCards, Wi-Fi, email, and more. Download as PNG, SVG or PDF. Add gradients, frames, logos — free, instant, no signup needed."
        canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/qr-code-generator`}
        keywords="free qr code generator, custom qr code, qr code maker, qr code download, vcard qr code, wifi qr code, dynamic qr code"
      />

      <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 mb-4">
              <QrCode className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">QR Code Generator</h1>
            <p className="text-slate-400 text-sm mt-1.5">Create custom QR codes — URL, vCard, WiFi, and more</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">

            {/* Left: Controls */}
            <div className="space-y-4">

              {/* Panel Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)]">
                {panels.map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setActivePanel(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activePanel === id ? 'bg-blue-600/15 text-blue-400 border border-blue-600/20' : 'text-slate-500 hover:text-slate-300'
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              {/* ---- CONTENT PANEL ---- */}
              {activePanel === 'content' && (
                <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-5 space-y-4">
                  {/* Type grid */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">QR Type</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {Object.entries(qrTypes).map(([key, { label, icon: Icon }]) => (
                        <button key={key}
                          onClick={() => { setQrType(key); setQrData(''); setError(''); }}
                          className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                            qrType === key ? 'border-blue-600/50 bg-blue-600/10 text-blue-400' : 'border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'
                          }`}>
                          <Icon className="w-4 h-4" />{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* vCard fields */}
                  {qrType === 'vcard' ? (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 uppercase tracking-wider">Contact Details</label>
                      {[
                        { val: vcardName,  set: setVcardName,  ph: 'Full Name *' },
                        { val: vcardPhone, set: setVcardPhone, ph: 'Phone Number' },
                        { val: vcardEmail, set: setVcardEmail, ph: 'Email Address' },
                        { val: vcardOrg,   set: setVcardOrg,   ph: 'Organization' },
                        { val: vcardUrl,   set: setVcardUrl,   ph: 'Website URL' },
                      ].map(({ val, set, ph }) => (
                        <Input key={ph} value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                          className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-600/50" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 uppercase tracking-wider">Content</label>
                      <Input placeholder={qrTypes[qrType].placeholder} value={qrData}
                        onChange={(e) => handleDataChange(e.target.value)}
                        className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-600/50" />
                    </div>
                  )}

                  {error && (
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-400 py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Logo upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Center Logo (optional)</label>
                    <div className="flex gap-3 items-center">
                      <Input type="file" accept="image/*" onChange={handleLogoUpload}
                        className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-slate-400 file:bg-[hsl(230,10%,20%)] file:text-slate-300 file:border-0 file:rounded-md file:px-2 file:py-1 file:text-xs" />
                      {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0">Remove</button>}
                    </div>
                  </div>
                </div>
              )}

              {/* ---- STYLE PANEL ---- */}
              {activePanel === 'style' && (
                <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-5 space-y-5">

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Dot Style</label>
                    <div className="flex gap-2">
                      {DOT_STYLES.map(({ value, label }) => (
                        <button key={value} onClick={() => setQrStyle(value)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${qrStyle === value ? 'border-blue-600/50 bg-blue-600/10 text-blue-400' : 'border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Corner Style</label>
                    <div className="flex gap-2">
                      {EYE_RADIUS_PRESETS.map(({ label, value }) => (
                        <button key={value} onClick={() => setEyeRadius(value)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${eyeRadius === value ? 'border-violet-600/50 bg-violet-600/10 text-violet-400' : 'border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Error Correction</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EC_LEVELS.map(({ value, label }) => (
                        <button key={value} onClick={() => setEcLevel(value)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${ecLevel === value ? 'border-emerald-600/50 bg-emerald-600/10 text-emerald-400' : 'border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'QR Color', val: fgColor, set: setFgColor },
                      { label: 'Background', val: bgColor, set: setBgColor },
                      { label: 'Corner Color', val: eyeColor, set: setEyeColor },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="space-y-1.5">
                        <label className="text-xs text-slate-500 uppercase tracking-wider">{label}</label>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)]">
                          <input type="color" value={val} onChange={(e) => set(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                          <span className="text-xs text-slate-500 font-mono truncate">{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Size: <span className="text-slate-300 font-medium">{size}px</span></label>
                    <Slider min={128} max={512} step={8} value={[size]} onValueChange={([v]) => setSize(v)} className="py-2" />
                    <div className="flex justify-between text-xs text-slate-600"><span>128px</span><span>512px</span></div>
                  </div>

                  {/* Gradient */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Gradient Color</label>
                      <button onClick={() => setUseGradient(g => !g)}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${useGradient ? 'bg-blue-600' : 'bg-[hsl(230,10%,20%)]'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${useGradient ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    {useGradient && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {GRADIENT_ANGLES.map(({ value, label }) => (
                            <button key={value} onClick={() => setGradientAngle(value)}
                              className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-all ${gradientAngle === value ? 'border-blue-600/50 bg-blue-600/10 text-blue-400' : 'border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[['From', gradientFrom, setGradientFrom], ['To', gradientTo, setGradientTo]].map(([label, val, set]) => (
                            <div key={label} className="space-y-1">
                              <label className="text-xs text-slate-500">{label}</label>
                              <div className="flex items-center gap-2 p-2 rounded-xl bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)]">
                                <input type="color" value={val} onChange={(e) => set(e.target.value)}
                                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                                <span className="text-xs text-slate-500 font-mono truncate">{val}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Frame / Template */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><LayoutTemplate className="w-3.5 h-3.5" /> Frame / Template</label>
                    <div className="flex gap-2">
                      {FRAME_STYLES.map(({ value, label }) => (
                        <button key={value} onClick={() => setFrameStyle(value)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${frameStyle === value ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {frameStyle !== 'none' && (
                      <input value={frameText} onChange={(e) => setFrameText(e.target.value)} placeholder="Frame text"
                        className="w-full px-3 py-2 text-sm text-white rounded-xl bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] focus:border-amber-500/50 focus:outline-none transition-colors" />
                    )}
                  </div>
                </div>
              )}

              {/* ---- HISTORY PANEL ---- */}
              {activePanel === 'history' && (
                <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-5 space-y-3">
                  {history.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No QR codes generated yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400 font-medium">Recent Codes</span>
                        <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Clear all
                        </button>
                      </div>
                      <div className="space-y-2">
                        {history.map((entry) => (
                          <button key={entry.id} onClick={() => loadFromHistory(entry)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-[hsl(230,10%,18%)] hover:border-blue-600/30 hover:bg-blue-600/5 transition-all text-left group">
                            <div className="w-8 h-8 rounded-lg shrink-0 border border-[hsl(230,10%,25%)] flex items-center justify-center" style={{ background: entry.bgColor }}>
                              <div className="w-4 h-4 rounded-sm" style={{ background: entry.fgColor, opacity: 0.7 }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-300 capitalize">{entry.type}</p>
                              <p className="text-xs text-slate-600 truncate">{entry.value}</p>
                            </div>
                            <span className="ml-auto text-xs text-slate-600 group-hover:text-blue-400 transition-colors shrink-0">Load</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ---- BULK PANEL ---- */}
              {activePanel === 'bulk' && (
                <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                      <Package className="w-4 h-4 text-violet-400" /> Bulk QR Generation
                    </h3>
                    <p className="text-xs text-slate-500">Upload a CSV or paste URLs below. Format: <code className="font-mono text-slate-400">url,label</code> per line. Downloads a ZIP of PNG files.</p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <input type="file" accept=".csv,.txt" ref={bulkFileRef} onChange={handleBulkFileUpload} className="hidden" />
                    <button
                      onClick={() => bulkFileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[hsl(230,10%,22%)] hover:border-violet-600/40 text-slate-500 hover:text-violet-400 transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" /> Upload CSV file
                    </button>
                  </div>

                  {/* Manual paste */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Or paste CSV content</label>
                    <textarea
                      value={bulkCsv}
                      onChange={e => handleBulkCsvChange(e.target.value)}
                      placeholder={"https://example.com,Example\nhttps://google.com,Google\nhttps://github.com,GitHub"}
                      rows={6}
                      className="w-full px-3 py-2.5 rounded-xl bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,20%)] text-white text-xs font-mono placeholder:text-slate-600 focus:border-violet-600/50 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Preview count */}
                  {bulkItems.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{bulkItems.length} URL{bulkItems.length !== 1 ? 's' : ''} ready</span>
                      <span className="text-slate-600">{bulkItems.slice(0, 3).map(i => i.label).join(', ')}{bulkItems.length > 3 ? ` +${bulkItems.length - 3} more` : ''}</span>
                    </div>
                  )}

                  {/* Progress */}
                  {bulkGenerating && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Generating...</span><span>{bulkProgress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500 transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={generateBulkZip}
                    disabled={bulkItems.length === 0 || bulkGenerating}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {bulkGenerating ? `Generating (${bulkProgress}%)...` : `Download ${bulkItems.length > 0 ? bulkItems.length + ' ' : ''}QR Codes as ZIP`}
                  </button>
                </div>
              )}

              {/* ---- DYNAMIC QR PANEL ---- */}
              {activePanel === 'dynamic' && (
                <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-5 space-y-5">
                  <div>
                    <p className="text-xs text-slate-300 font-semibold mb-0.5">Dynamic QR Codes</p>
                    <p className="text-[11px] text-slate-500">The QR image stays the same — only the destination changes. Perfect for print/labels.</p>
                  </div>

                  {/* Create form */}
                  <div className="space-y-2 p-4 rounded-xl bg-[hsl(230,10%,11%)] border border-[hsl(230,10%,18%)]">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Create New</p>
                    <Input
                      value={dynForm.title}
                      onChange={e => setDynForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Label (optional)"
                      className="bg-[hsl(230,10%,10%)] border-[hsl(230,10%,20%)] text-white text-sm"
                    />
                    <Input
                      value={dynForm.targetUrl}
                      onChange={e => setDynForm(p => ({ ...p, targetUrl: e.target.value }))}
                      placeholder="Destination URL *"
                      className="bg-[hsl(230,10%,10%)] border-[hsl(230,10%,20%)] text-white text-sm"
                    />
                    <button
                      onClick={createDynQr}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> Create Dynamic QR
                    </button>
                  </div>

                  {/* List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Your Dynamic QRs</p>
                      <button onClick={loadDynQrs} className="text-slate-500 hover:text-white transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${dynLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    {dynList.length === 0 && !dynLoading && (
                      <p className="text-xs text-slate-600 text-center py-4">No dynamic QRs yet</p>
                    )}
                    {dynList.map(item => (
                      <div key={item.id} className="rounded-xl border border-[hsl(230,10%,18%)] bg-[hsl(230,10%,11%)] p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{item.title || 'Untitled'}</p>
                            <p className="text-[11px] text-slate-500 font-mono truncate">/qr/{item.shortCode}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-500">{item.scans} scans</span>
                            <button
                              onClick={() => { setDynEditing(item.id); setDynEditUrl(item.targetUrl); }}
                              className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                            ><Edit2 className="w-3.5 h-3.5" /></button>
                            <button
                              onClick={() => window.open(item.targetUrl, '_blank')}
                              className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                            ><ExternalLink className="w-3.5 h-3.5" /></button>
                            <button
                              onClick={() => deleteDynQr(item.id)}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            ><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {dynEditing === item.id && (
                          <div className="flex gap-2">
                            <Input
                              value={dynEditUrl}
                              onChange={e => setDynEditUrl(e.target.value)}
                              placeholder="New destination URL"
                              className="flex-1 bg-[hsl(230,10%,9%)] border-blue-600/40 text-white text-xs h-8"
                            />
                            <button onClick={() => updateDynQr(item.id)}
                              className="px-3 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors">Save</button>
                            <button onClick={() => setDynEditing(null)}
                              className="px-2 h-8 rounded-lg bg-[hsl(230,10%,16%)] text-slate-400 text-xs hover:bg-[hsl(230,10%,20%)] transition-colors">✕</button>
                          </div>
                        )}
                        {dynEditing !== item.id && (
                          <p className="text-[11px] text-slate-600 truncate">→ {item.targetUrl}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview + Actions */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Preview</p>

                {/* Frame wrapper */}
                <div className={`flex flex-col items-center rounded-xl overflow-hidden ${
                  frameStyle === 'border'  ? 'ring-4 ring-offset-4 ring-offset-[hsl(230,12%,9%)] ring-slate-600' :
                  frameStyle === 'corner'  ? 'outline outline-2 outline-offset-8 outline-slate-700' : ''
                }`}>
                  {/* QR with gradient overlay */}
                  <div id={qrId} className="relative flex items-center justify-center" style={{ background: bgColor, minHeight: 180 }}>
                    {isValid ? (
                      <>
                        <QRCode
                          value={effectiveValue}
                          size={Math.min(size, 260)}
                          fgColor={fgColor}
                          bgColor={bgColor}
                          qrStyle={qrStyle}
                          eyeRadius={eyeRadius}
                          eyeColor={eyeColor}
                          ecLevel={ecLevel}
                          quietZone={10}
                          logoImage={logo || undefined}
                          logoWidth={logo ? Math.min(size, 260) * 0.22 : undefined}
                          logoHeight={logo ? Math.min(size, 260) * 0.22 : undefined}
                          removeQrCodeBehindLogo={!!logo}
                        />
                        {useGradient && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`,
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none'
                          }} />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center py-10 text-slate-500">
                        <QrCode className="w-14 h-14 mb-2 opacity-20" />
                        <p className="text-xs">Enter content to preview</p>
                      </div>
                    )}
                  </div>
                  {/* Frame label */}
                  {frameStyle !== 'none' && (
                    <div className="w-full text-center py-2.5 text-sm font-semibold tracking-wide" style={{ background: bgColor, color: fgColor }}>
                      {frameText}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button onClick={copyToClipboard} disabled={!isValid}
                  className="w-full bg-[hsl(230,10%,14%)] hover:bg-[hsl(230,10%,18%)] border border-[hsl(230,10%,20%)] text-white font-medium rounded-xl h-11 transition-all disabled:opacity-40">
                  {copied
                    ? <><Check className="w-4 h-4 mr-2 text-emerald-400" /> Copied!</>
                    : <><Copy className="w-4 h-4 mr-2" /> Copy to Clipboard</>}
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={downloadPNG} disabled={!isValid}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-11 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-40">
                    <Download className="w-4 h-4 mr-1" /> PNG
                  </Button>
                  <Button onClick={downloadSVG} disabled={!isValid}
                    className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-600/30 text-violet-300 font-semibold rounded-xl h-11 transition-all disabled:opacity-40">
                    <Download className="w-4 h-4 mr-1" /> SVG
                  </Button>
                  <Button onClick={downloadPDF} disabled={!isValid}
                    className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/30 text-rose-300 font-semibold rounded-xl h-11 transition-all disabled:opacity-40">
                    <FileDown className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>

              {/* Quick summary */}
              <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-3 space-y-1.5 text-xs text-slate-500">
                {[
                  ['Dot style',         <span className="capitalize">{qrStyle}</span>],
                  ['Corner style',      EYE_RADIUS_PRESETS.find(e=>e.value===eyeRadius)?.label],
                  ['Error correction',  ecLevel],
                  ['Output size',       `${size}×${size}px`],
                  ['Gradient',          useGradient ? `${gradientFrom} → ${gradientTo}` : 'Off'],
                  ['Frame',             frameStyle === 'none' ? 'None' : `${FRAME_STYLES.find(f=>f.value===frameStyle)?.label}: "${frameText}"`],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span className="text-slate-300">{v}</span></div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default QRCodeGenerator;
