import { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, Mail, Smartphone, Map, Wifi, Calendar, FileText, Download, AlertCircle } from 'lucide-react';
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
      case 'wifi':{
        const [ssid, password] = value.split(',');
        return `WIFI:S:${ssid.trim()};T:WPA;P:${password.trim()};;`;
      }
      case 'location':{
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
    <div className={`
      transform transition-all duration-200 ease-in-out
      ${error ? 'opacity-50' : 'opacity-100'}
      ${qrData ? 'scale-100' : 'scale-95'}
    `}>
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
          description="Create customizable QR codes for your URLs, business cards, or marketing materials. Generate high-quality QR codes with advanced tracking features."
          canonical="https://trimlink.netlify.app/qr-code-generator"
          keywords="QR code generator, create QR code, custom QR codes, QR code tracking, scannable QR codes, dynamic QR codes"
          // ogImage="https://trimlink.netlify.app/qr-preview.jpg"
          author="TrimLink"
          language="en"
       />    
    <div className="min-h-screen p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Smart QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Select value={qrType} onValueChange={(value) => {
                setQrType(value);
                setQrData('');
                setError('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select QR Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(qrTypes).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder={qrTypes[qrType].placeholder}
                value={qrData}
                onChange={(e) => handleDataChange(e.target.value)}
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Size (px)</label>
                  <Input
                    type="number"
                    min="100"
                    max="400"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Logo</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">QR Color</label>
                  <Input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Background</label>
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={downloadQRCode} 
                disabled={!qrData || !!error}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            </div>

            <div
              ref={canvasRef}
              className="flex items-center justify-center p-4 bg-white rounded-lg shadow-inner"
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
                  <div className="flex flex-col items-center text-gray-400">
                    <AlertCircle className="w-12 h-12 mb-2" />
                    <p>Enter data to generate QR code</p>
                  </div>
                )}
              </QRCodeWrapper>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>

  );
  
};

export default QRCodeGenerator;