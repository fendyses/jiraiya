<?php
// Live system metrics for the JIRAIYA dashboard (macOS, served by ServBay PHP).
// Polled by dashboard.php every ~1.5s. Same-origin → no separate process / CORS.
require __DIR__ . '/../auth.php';
if (!jiraiya_is_authed()) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo '{"error":"unauthorized"}';
    exit;
}
session_write_close();   // release the session lock so polls don't serialize
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');

// php-fpm (ServBay) runs with a minimal PATH that omits /usr/sbin and /sbin,
// where sysctl / netstat / route live — without this they silently fail and
// CPU pegs at 100%, RAM total reads 0, and network shows 0 B/s.
putenv('PATH=/usr/sbin:/sbin:/usr/bin:/bin:/usr/local/bin');

function sh($cmd) { return trim((string) @shell_exec($cmd)); }

// ───────── CPU ───────── instantaneous utilisation = Σ per-process %cpu / cores
$ncpu = (int) sh('sysctl -n hw.ncpu');
if ($ncpu < 1) $ncpu = 1;
$cpuSum = (float) sh("ps -A -o %cpu= | awk '{s+=\$1} END{print s}'");
$cpu = $cpuSum / $ncpu;
if ($cpu < 0)   $cpu = 0;
if ($cpu > 100) $cpu = 100;
$chip = sh('sysctl -n machdep.cpu.brand_string');

// ───────── RAM ───────── used ≈ active + wired + compressed pages
$memTotal = (float) sh('sysctl -n hw.memsize');
$pageSize = (float) sh('sysctl -n hw.pagesize');
if ($pageSize < 1) $pageSize = 4096;
$vm = sh('vm_stat');
$pages = function ($label) use ($vm) {
    if (preg_match('/' . preg_quote($label, '/') . ':\s+(\d+)/', $vm, $m)) return (float) $m[1];
    return 0.0;
};
$memUsed = ($pages('Pages active') + $pages('Pages wired down')
            + $pages('Pages occupied by compressor')) * $pageSize;
$memPct  = $memTotal > 0 ? ($memUsed / $memTotal * 100) : 0;

// ───────── Storage ─────────
$cols = preg_split('/\s+/', sh("df -k /System/Volumes/Data | tail -1"));
$diskTotal = isset($cols[1]) ? (float) $cols[1] * 1024 : 0;
$diskUsed  = isset($cols[2]) ? (float) $cols[2] * 1024 : 0;
$diskPct   = $diskTotal > 0 ? ($diskUsed / $diskTotal * 100) : 0;

// ───────── Network ───────── byte-counter deltas → rate (state in temp file)
$iface = sh("route -n get default 2>/dev/null | awk '/interface:/{print \$2}'");
if ($iface === '') $iface = 'en0';
$nc = preg_split('/\s+/', sh("netstat -ibn | awk '\$1==\"$iface\" && \$3 ~ /Link/ {print; exit}'"));
$rx = isset($nc[6]) ? (float) $nc[6] : 0;
$tx = isset($nc[9]) ? (float) $nc[9] : 0;

$now       = microtime(true);
$stateFile = sys_get_temp_dir() . '/jiraiya_netstat.json';
$downBps   = 0.0;
$upBps     = 0.0;
if (is_readable($stateFile)) {
    $prev = json_decode((string) @file_get_contents($stateFile), true);
    if (is_array($prev) && isset($prev['t'])) {
        $dt = $now - (float) $prev['t'];
        if ($dt > 0) {
            $dRx = $rx - (float) $prev['rx'];
            $dTx = $tx - (float) $prev['tx'];
            if ($dRx >= 0) $downBps = $dRx / $dt;
            if ($dTx >= 0) $upBps   = $dTx / $dt;
        }
    }
}
@file_put_contents($stateFile, json_encode(['t' => $now, 'rx' => $rx, 'tx' => $tx]));

echo json_encode([
    'cpu'  => ['pct' => round($cpu, 1), 'cores' => $ncpu, 'chip' => $chip],
    'ram'  => ['pct' => round($memPct, 1), 'usedBytes' => $memUsed, 'totalBytes' => $memTotal],
    'disk' => ['pct' => round($diskPct, 1), 'usedBytes' => $diskUsed, 'totalBytes' => $diskTotal],
    'net'  => ['downBps' => $downBps, 'upBps' => $upBps, 'iface' => $iface],
]);
