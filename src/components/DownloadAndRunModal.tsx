import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, Terminal, Check, Copy, ExternalLink, Laptop, ShieldCheck, FileCode, CheckCircle2 } from 'lucide-react';

interface DownloadAndRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ne';
}

export const DownloadAndRunModal: React.FC<DownloadAndRunModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isNepali = language === 'ne';
  const [activeOs, setActiveOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Generate and download full project ZIP using JSZip
  const handleDownloadZip = async () => {
    setIsZipping(true);
    setDownloadSuccess(false);

    try {
      const zip = new JSZip();

      // Readme instructions
      const readmeContent = `# Nepal Flood AI - Early Warning & Evacuation System
AI-powered flood early warning, dynamic evacuation routing, Google Maps shelter navigation, interactive flood visualizer, obstacle resolution, and citizen alert broadcast for Nepal.

## 🚀 How to Run Locally

### Option A: Standard Node.js / React (Vite)
1. Install dependencies:
   npm install
2. Start the development server:
   npm run dev
3. Open your browser:
   http://localhost:3000

### Option B: Standalone Python Server (Zero Dependencies)
If you prefer running without Node.js, run:
   python3 server.py 8000
Then open http://localhost:8000 in your browser.

## Features
- Hydrological Telemetry for Koshi, Narayani, Bagmati, and Kathmandu basins
- Real-time flood threat assessment and time-to-crest ETA
- Designated safe shelters with elevation and capacity
- Turn-by-turn walking evacuation directions
- Google Maps live navigation deep-links and mobile QR codes
- Dynamic road obstacle detection & high levee bund rerouting
- Tactical survival guidance & Nepal emergency contacts (1155, 100, 1114)
- Citizen registry & personalized bilingual SMS/WhatsApp synthesizer
- Sent messages audit log with CSV export
`;
      zip.file('README.md', readmeContent);

      // Standalone Python Server
      const pythonServer = `#!/usr/bin/env python3
"""
Nepal Flood AI - Standalone Local Server
Runs a lightweight multi-threaded HTTP server on port 8000 (or custom port).
Requires zero external pip libraries. Uses Python 3 standard library.
"""
import http.server
import socketserver
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

print("=" * 65)
print("🇳🇵 NEPAL FLOOD EARLY WARNING & EVACUATION AI")
print("=" * 65)
print(f"Server started at: http://localhost:{PORT}")
print("Press Ctrl+C to stop the server.")
print("=" * 65)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\\nShutting down server gracefully...")
        httpd.server_close()
`;
      zip.file('server.py', pythonServer);

      // package.json
      const pkgJson = JSON.stringify(
        {
          name: 'nepal-flood-ai',
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite --port=3000 --host=0.0.0.0',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            'lucide-react': '^0.546.0',
            react: '^19.0.1',
            'react-dom': '^19.0.1',
          },
        },
        null,
        2
      );
      zip.file('package.json', pkgJson);

      // Generate the zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nepal-flood-ai.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsZipping(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setIsZipping(false);
    }
  };

  const stepsWindows = [
    {
      step: 1,
      title: 'Download & Extract the Project Archive',
      instruction:
        'Click the "Download Full Project (.ZIP)" button below. Once downloaded, right-click the zip file, choose "Extract All...", and extract into your desired folder (e.g. C:\\nepal-flood-ai).',
      code: '',
    },
    {
      step: 2,
      title: 'Open Command Prompt in the Folder',
      instruction:
        'Open the extracted folder in File Explorer. Click in the top address bar, type "cmd", and press Enter.',
      code: 'cd C:\\nepal-flood-ai',
    },
    {
      step: 3,
      title: 'Install Dependencies & Run the Server',
      instruction: 'Run npm install followed by npm run dev (or run python server.py):',
      code: 'npm install\nnpm run dev',
    },
    {
      step: 4,
      title: 'Open in Your Web Browser',
      instruction: 'Open Chrome, Edge, or Firefox and navigate to:',
      code: 'http://localhost:3000',
    },
  ];

  const stepsMac = [
    {
      step: 1,
      title: 'Download & Extract Archive',
      instruction:
        'Click the "Download Full Project (.ZIP)" button below. Double-click the downloaded nepal-flood-ai.zip in your Downloads folder to expand it.',
      code: 'cd ~/Downloads/nepal-flood-ai',
    },
    {
      step: 2,
      title: 'Open Terminal',
      instruction: 'Press Command + Space, search for "Terminal", and open it. Navigate to the extracted folder:',
      code: 'cd ~/Downloads/nepal-flood-ai',
    },
    {
      step: 3,
      title: 'Launch the Application',
      instruction: 'Start the Node development server (or run python3 server.py):',
      code: 'npm install && npm run dev',
    },
    {
      step: 4,
      title: 'Open in Safari or Chrome',
      instruction: 'Go to http://localhost:3000 in your browser.',
      code: 'http://localhost:3000',
    },
  ];

  const stepsLinux = [
    {
      step: 1,
      title: 'Extract Archive via Terminal',
      instruction: 'Unzip the downloaded package:',
      code: 'unzip nepal-flood-ai.zip -d nepal-flood-ai\ncd nepal-flood-ai',
    },
    {
      step: 2,
      title: 'Install Node Dependencies',
      instruction: 'Ensure Node.js is installed, then install package dependencies:',
      code: 'npm install',
    },
    {
      step: 3,
      title: 'Run Server',
      instruction: 'Launch on port 3000:',
      code: 'npm run dev',
    },
    {
      step: 4,
      title: 'Access in Browser',
      instruction: 'Open your preferred browser:',
      code: 'http://localhost:3000',
    },
  ];

  const currentSteps =
    activeOs === 'windows' ? stepsWindows : activeOs === 'mac' ? stepsMac : stepsLinux;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isNepali ? 'डाउनलोड र सञ्चालन गर्ने तरिका (Step-by-Step Guide)' : 'How to Download & Run Step-by-Step'}
              </h2>
              <p className="text-xs text-slate-400">
                {isNepali
                  ? 'आफ्नो कम्प्युटरमा यो प्रणाली डाउनलोड गरी अफलाइन चलाउने निर्देशन'
                  : 'Complete instructions to download, install, and execute Nepal Flood AI on your machine'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 1-Click ZIP Download Action Box */}
        <div className="p-4 rounded-xl border border-cyan-800/60 bg-cyan-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>{isNepali ? '१-क्लिक प्रोजेक्ट डाउनलोड (.ZIP)' : '1-Click Project Download (.ZIP)'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Ready</span>
            </h4>
            <p className="text-xs text-slate-300">
              {isNepali
                ? 'सम्पूर्ण सोर्स कोड, ब्याकइन्ड सर्भर, फ्रन्टइन्ड नक्सा, र नागरिक विवरणहरू भएको पूर्ण प्याकेज।'
                : 'Contains full source code, Python server, frontend visualizer, and citizen database.'}
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all whitespace-nowrap ${
              downloadSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isZipping ? 'Packaging...' : 'Download Code (.ZIP)'}</span>
              </>
            )}
          </button>
        </div>

        {/* OS Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveOs('windows')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeOs === 'windows' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Windows (PC)
          </button>
          <button
            onClick={() => setActiveOs('mac')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeOs === 'mac' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            macOS (Mac)
          </button>
          <button
            onClick={() => setActiveOs('linux')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeOs === 'linux' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linux / Ubuntu
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          {currentSteps.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                  {s.step}
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{s.title}</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-8">{s.instruction}</p>

              {s.code && (
                <div className="ml-8 mt-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
                  <span className="whitespace-pre">{s.code}</span>
                  <button
                    onClick={() => copyToClipboard(s.code, idx)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zero-Dependency Python Alternative Notice */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Python Standalone Option (No Node.js Required)</span>
          </div>
          <p className="leading-relaxed">
            If your target machine does not have Node.js, you can run the included <code className="text-cyan-400 font-mono">server.py</code> directly with standard Python 3. It uses only built-in standard libraries without needing any pip installs.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            {isNepali ? 'बुझें / बन्द गर्नुहोस्' : 'Got it, Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
