import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root and node_modules
app.use(express.static(__dirname));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// API: Store Status
app.get('/api/status', (req, res) => {
  // Gwalior Time Zone (Asia/Kolkata)
  const now = new Date();
  const utcOffset = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60000;
  const gwaliorTime = new Date(utcOffset + istOffset);

  const hours = gwaliorTime.getHours();
  const minutes = gwaliorTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Open hours: 10:00 AM (600 mins) to 9:00 PM (1260 mins)
  const openTime = 10 * 60;
  const closeTime = 21 * 60;

  const isOpen = totalMinutes >= openTime && totalMinutes < closeTime;

  let timeMessage = '';
  if (isOpen) {
    const minsToClose = closeTime - totalMinutes;
    const hrsLeft = Math.floor(minsToClose / 60);
    const minsLeft = minsToClose % 60;
    timeMessage = `Closes in ${hrsLeft > 0 ? hrsLeft + 'h ' : ''}${minsLeft}m (9:00 PM)`;
  } else {
    timeMessage = 'Opens tomorrow at 10:00 AM';
  }

  res.json({
    shopName: 'Ashu Mobile',
    location: 'Shop No. 26, Rajeev Plaza, Jayendraganj, Gwalior',
    phone: '093038 42111',
    whatsappPhone: '919303842111',
    isOpen,
    statusText: isOpen ? 'Open Now' : 'Closed Now',
    timeMessage,
    currentTimeIST: gwaliorTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    openingHours: '10:00 AM – 9:00 PM (Mon - Sun)'
  });
});

// API: Quick Inquiry
app.post('/api/inquiry', (req, res) => {
  const { name, phone, item, message } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  console.log(`[Inquiry Received] Name: ${name || 'N/A'}, Phone: ${phone}, Item: ${item || 'General'}, Message: ${message || 'N/A'}`);

  res.json({
    success: true,
    message: 'Inquiry received successfully! Our team at Ashu Mobile will respond shortly.',
    whatsappUrl: `https://wa.me/919303842111?text=${encodeURIComponent(`Hi Ashu Mobile, my name is ${name || 'Customer'} (${phone}). I am inquiring about: ${item || 'phones/accessories'}. ${message || ''}`)}`
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Ashu Mobile server running on http://0.0.0.0:${port}`);
});
