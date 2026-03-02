import { useState, useRef, useCallback, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import QRCodeLib from 'qrcode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import {
  Link, Mail, Smartphone, Map, Wifi, Calendar, FileText, Download,
  AlertCircle, QrCode, Copy, Check, User, History, Trash2,
  Layers, Eye, Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { SEOMetadata } from '@/components/seo-metadata';

const QR_HISTORY_KEY = 'trimlink_qr_history';
const MAX_HISTORY = 8;

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
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
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

  const panels = [
    { id: 'content', icon: FileText, label: 'Content' },
    { id: 'style',   icon: Palette,  label: 'Style' },
    { id: 'history', icon: History,  label: `History${history.length ? ` (${history.length})` : ''}` },
  ];

  return (
    <>
      <SEOMetadata
        title="Free QR Code Generator | TrimLink"
        description="Create customizable QR codes for URLs, vCards, WiFi, email and more."
        canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/qr-code-generator`}
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
                    <div className="grid grid-cols-4 gap-1.5">
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
            </div>

            {/* Right: Preview + Actions */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Preview</p>
                <div id={qrId} className="flex items-center justify-center rounded-xl overflow-hidden" style={{ background: bgColor, minHeight: 180 }}>
                  {isValid ? (
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
                  ) : (
                    <div className="flex flex-col items-center py-10 text-slate-500">
                      <QrCode className="w-14 h-14 mb-2 opacity-20" />
                      <p className="text-xs">Enter content to preview</p>
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
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadPNG} disabled={!isValid}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-11 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-40">
                    <Download className="w-4 h-4 mr-1.5" /> PNG
                  </Button>
                  <Button onClick={downloadSVG} disabled={!isValid}
                    className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-600/30 text-violet-300 font-semibold rounded-xl h-11 transition-all disabled:opacity-40">
                    <Download className="w-4 h-4 mr-1.5" /> SVG
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
