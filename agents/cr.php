<?php
session_start();
if (!isset($_SESSION['jiraiya_auth'])) { http_response_code(403); echo '[]'; exit; }
header('Content-Type: application/json; charset=utf-8');

$crDir = dirname(__DIR__) . '/CR';
$files = glob($crDir . '/*.md');
if (!$files) { echo '[]'; exit; }

$results = [];
foreach ($files as $f) {
    $name = basename($f, '.md');
    if ($name === 'cr-format') continue;
    $content = @file_get_contents($f);
    if ($content === false) continue;
    $results[] = ['file' => $name, 'content' => $content];
}

// Sort: latest month-year first. File names: "6-2026", "12-2026"
usort($results, function($a, $b) {
    $pa = explode('-', $a['file']); $pb = explode('-', $b['file']);
    $ya = (int)($pa[1] ?? 0); $yb = (int)($pb[1] ?? 0);
    if ($ya !== $yb) return $yb - $ya;
    $ma = (int)($pa[0] ?? 0); $mb = (int)($pb[0] ?? 0);
    return $mb - $ma;
});

echo json_encode($results, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
