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
        canonical="https://trimlynk.com/qr-code-generator"
        keywords="QR code generator, create QR code, custom QR codes"
        author="TrimLink"
        language="en"
      />

      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <QrCode className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">QR Code Generator</h1>
            <p className="text-zinc-500 text-sm mt-1">Create custom QR codes for any purpose</p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">QR Type</label>
                    <Select value={qrType} onValueChange={(value) => {
                      setQrType(value);
                      setQrData('');
                      setError('');
                    }}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select QR Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {Object.entries(qrTypes).map(([key, { label, icon: Icon }]) => (
                          <SelectItem key={key} value={key} className="text-zinc-300 focus:bg-zinc-800">
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
                    <label className="text-sm text-zinc-400">Content</label>
                    <Input
                      placeholder={qrTypes[qrType].placeholder}
                      value={qrData}
                      onChange={(e) => handleDataChange(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Size (px)</label>
                      <Input
                        type="number"
                        min="100"
                        max="400"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Logo (optional)</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="bg-zinc-800 border-zinc-700 text-zinc-400 file:bg-zinc-700 file:text-zinc-300 file:border-0 file:rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">QR Color</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm text-zinc-500 font-mono">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Background</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm text-zinc-500 font-mono">{bgColor}</span>
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
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>

                {/* Preview */}
                <div
                  ref={canvasRef}
                  className="flex items-center justify-center p-6 bg-white rounded-xl min-h-[280px]"
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
                      <div className="flex flex-col items-center text-zinc-400">
                        <QrCode className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm">Enter content to generate QR code</p>
                      </div>
                    )}
                  </QRCodeWrapper>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default QRCodeGenerator;