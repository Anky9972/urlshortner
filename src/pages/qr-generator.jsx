import { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, Mail, Smartphone, Map, Wifi, Calendar, FileText, Download, AlertCircle, QrCode } from 'lucide-react';
import PropTypes from 'prop-types';
import { SEOMetadata } from '@/components/seo-metadata';

const QRCodeGenerator = () => {
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState('');
  const [qrType, setQrType] = useState('url');
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState(null);
  const canvasRef = useRef(null);

  const qrTypes = {
    url: {
      label: 'URL',
      icon: Link,
      placeholder: 'https://example.com',
      validate: (value) => value.startsWith('http://') || value.startsWith('https://') ? '' : 'Please enter a valid URL starting with http:// or https://'
    },
    email: {
      label: 'Email',
      icon: Mail,
      placeholder: 'email@example.com',
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address'
    },
    phone: {
      label: 'Phone',
      icon: Smartphone,
      placeholder: '+1234567890',
      validate: (value) => /^\+?[\d\s-]{10,}$/.test(value) ? '' : 'Please enter a valid phone number'
    },
    location: {
      label: 'Location',
      icon: Map,
      placeholder: 'Latitude, Longitude',
      validate: (value) => {
        const [lat, lng] = value.split(',').map(v => parseFloat(v.trim()));
        return (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) ? '' : 'Please enter valid coordinates'
      }
    },
    wifi: {
      label: 'WiFi',
      icon: Wifi,
      placeholder: 'SSID, Password',
      validate: (value) => value.includes(',') ? '' : 'Please enter SSID and password separated by comma'
    },
    event: {
      label: 'Event',
      icon: Calendar,
      placeholder: 'Event Details',
      validate: (value) => value.length > 0 ? '' : 'Please enter event details'
    },
    text: {
      label: 'Text',
      icon: FileText,
      placeholder: 'Enter your text',
      validate: (value) => value.length > 0 ? '' : 'Please enter some text'
    }
  };

  const formatQRData = (type, value) => {
    switch (type) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/\s+/g, '')}`;
      case 'wifi': {
        const [ssid, password] = value.split(',');
        return `WIFI:S:${ssid.trim()};T:WPA;P:${password.trim()};;`;
      }
      case 'location': {
        const [lat, lng] = value.split(',');
        return `geo:${lat.trim()},${lng.trim()}`;
      }
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${value}\nEND:VEVENT`;
      default:
        return value;
    }
  };

  const handleDataChange = (value) => {
    setQrData(value);
    const validationError = qrTypes[qrType].validate(value);
    setError(validationError);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        setError('Logo file size should be less than 500KB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
        setError('');
      };
      reader.onerror = () => {
        setError('Error reading logo file');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.querySelector('canvas');
      if (canvas) {
        try {
          const imageData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imageData;
          link.download = `qrcode-${qrType}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          setError('Error downloading QR code');
        }
      }
    }
  };

  const QRCodeWrapper = ({ children }) => (
    <div className={`transition-all duration-200 ${error ? 'opacity-50' : 'opacity-100'} ${qrData ? 'scale-100' : 'scale-95'}`}>
      {children}
    </div>
  );

  QRCodeWrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <>
      <SEOMetadata
        title="Free QR Code Generator | TrimLink"
        description="Create customizable QR codes for your URLs, business cards, or marketing materials."
        canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/qr-code-generator`}
        keywords="QR code generator, create QR code, custom QR codes"
        author="TrimLink"
        language="en"
      />

      <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 mb-5">
              <QrCode className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">QR Code Generator</h1>
            <p className="text-slate-400 text-sm mt-2">Create custom QR codes for any purpose</p>
          </div>

          <div className="relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">QR Type</label>
                    <Select value={qrType} onValueChange={(value) => {
                      setQrType(value);
                      setQrData('');
                      setError('');
                    }}>
                      <SelectTrigger className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white">
                        <SelectValue placeholder="Select QR Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                        {Object.entries(qrTypes).map(([key, { label, icon: Icon }]) => (
                          <SelectItem key={key} value={key} className="text-slate-300 focus:bg-[hsl(230,10%,14%)]">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Content</label>
                    <Input
                      placeholder={qrTypes[qrType].placeholder}
                      value={qrData}
                      onChange={(e) => handleDataChange(e.target.value)}
                      className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-500 focus:border-blue-600/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Size (px)</label>
                      <Input
                        type="number"
                        min="100"
                        max="400"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Logo (optional)</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-slate-400 file:bg-[hsl(230,10%,20%)] file:text-slate-300 file:border-0 file:rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">QR Color</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] cursor-pointer"
                        />
                        <span className="text-sm text-slate-500 font-mono">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">Background</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] cursor-pointer"
                        />
                        <span className="text-sm text-slate-500 font-mono">{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={downloadQRCode}
                    disabled={!qrData || !!error}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 rounded-xl h-11 hover:shadow-lg hover:shadow-blue-600/20 transition-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>

                {/* Preview */}
                <div
                  ref={canvasRef}
                  className="flex items-center justify-center p-6 bg-white rounded-2xl min-h-[280px] shadow-inner"
                >
                  <QRCodeWrapper>
                    {qrData ? (
                      <QRCode
                        value={formatQRData(qrType, qrData)}
                        size={size}
                        fgColor={fgColor}
                        bgColor={bgColor}
                        level="Q"
                        imageSettings={logo ? {
                          src: logo,
                          height: size * 0.2,
                          width: size * 0.2,
                          excavate: true,
                        } : undefined}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <QrCode className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm">Enter content to generate QR code</p>
                      </div>
                    )}
                  </QRCodeWrapper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRCodeGenerator;