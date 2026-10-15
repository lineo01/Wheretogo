#!/usr/bin/env python3
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

if __name__ == '__main__':
    print("=" * 65)
    print("🇳🇵 NEPAL FLOOD EARLY WARNING & EVACUATION AI")
    print("=" * 65)
    print(f"Local Server running at: http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server.")
    print("=" * 65)

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()
