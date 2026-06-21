#!/usr/bin/env python3
"""
JIRAIYA dashboard — live system stats server (macOS).

Serves CPU / RAM / disk / network metrics as JSON at:
    http://127.0.0.1:7842/stats

CORS is open so the dashboard works no matter how it is opened
(VS Code Live Server, file://, ServBay, etc.).

Run:
    python3 scripts/stats-server.py
Then leave it running while you use agents/dashboard.html.
"""

import json
import re
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 7842

# Previous network sample, kept in memory between requests for rate calc.
_net_prev = {"t": None, "rx": 0.0, "tx": 0.0}


def sh(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, text=True,
                                       stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def collect():
    # ── CPU ── instantaneous utilisation = sum of per-process %cpu / cores
    ncpu = int(sh("sysctl -n hw.ncpu") or 1) or 1
    try:
        cpu_sum = float(sh("ps -A -o %cpu= | awk '{s+=$1} END{print s}'") or 0)
    except ValueError:
        cpu_sum = 0.0
    cpu = max(0.0, min(100.0, cpu_sum / ncpu))
    chip = sh("sysctl -n machdep.cpu.brand_string")

    # ── RAM ── used ≈ active + wired + compressed pages (Activity Monitor-style)
    mem_total = float(sh("sysctl -n hw.memsize") or 0)
    page = float(sh("sysctl -n hw.pagesize") or 4096) or 4096
    vm = sh("vm_stat")

    def pages(label):
        m = re.search(re.escape(label) + r":\s+(\d+)", vm)
        return float(m.group(1)) if m else 0.0

    mem_used = (pages("Pages active") + pages("Pages wired down") +
                pages("Pages occupied by compressor")) * page
    mem_pct = (mem_used / mem_total * 100) if mem_total else 0

    # ── Storage ──
    df = sh("df -k /System/Volumes/Data | tail -1").split()
    disk_total = float(df[1]) * 1024 if len(df) > 1 else 0
    disk_used = float(df[2]) * 1024 if len(df) > 2 else 0
    disk_pct = (disk_used / disk_total * 100) if disk_total else 0

    # ── Network ── byte-counter deltas → rate
    iface = sh("route -n get default 2>/dev/null | awk '/interface:/{print $2}'") or "en0"
    line = sh("netstat -ibn | awk '$1==\"%s\" && $3 ~ /Link/ {print; exit}'" % iface).split()
    rx = float(line[6]) if len(line) > 6 else 0.0
    tx = float(line[9]) if len(line) > 9 else 0.0

    now = time.time()
    down_bps = up_bps = 0.0
    if _net_prev["t"] is not None:
        dt = now - _net_prev["t"]
        if dt > 0:
            d_rx = rx - _net_prev["rx"]
            d_tx = tx - _net_prev["tx"]
            if d_rx >= 0:
                down_bps = d_rx / dt
            if d_tx >= 0:
                up_bps = d_tx / dt
    _net_prev.update(t=now, rx=rx, tx=tx)

    return {
        "cpu": {"pct": round(cpu, 1), "cores": ncpu, "chip": chip},
        "ram": {"pct": round(mem_pct, 1), "usedBytes": mem_used, "totalBytes": mem_total},
        "disk": {"pct": round(disk_pct, 1), "usedBytes": disk_used, "totalBytes": disk_total},
        "net": {"downBps": down_bps, "upBps": up_bps, "iface": iface},
    }


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip("/") not in ("/stats", ""):
            self.send_response(404)
            self._cors()
            self.end_headers()
            return
        try:
            body = json.dumps(collect()).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_response(500)
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, *args):
        pass  # quiet


if __name__ == "__main__":
    print(f"JIRAIYA stats server → http://127.0.0.1:{PORT}/stats  (Ctrl+C to stop)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
