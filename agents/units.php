<?php
// ─────────────────────────────────────────────────────────────────────────
//  UnITS answer-pattern API for the JIRAIYA dashboard. Auth-gated.
//
//  One folder per UnITS category:  units/<slug>/answer-patterns.md
//
//    GET  ?action=list                          → [{slug, title, content, automation, scope}]
//    POST action=save        slug=… content=…   → overwrite a category file
//    POST action=create      name=…             → new category folder + template
//    POST action=automation  slug=… value=YES|NO → set the "**Automation Answer:**" flag
//
//  Automation gate: a category may be answered by AI only when its file says
//  "**Automation Answer:** YES" (optionally limited by "**Automation Scope:** SUB, SUB").
// ─────────────────────────────────────────────────────────────────────────
require __DIR__ . '/../auth.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if (!jiraiya_is_authed()) { http_response_code(403); echo json_encode(['error' => 'unauthorized']); exit; }

$UNITS = dirname(__DIR__) . '/units';

// "MOBILE APPS - MYSTUDENT" → "mobile-apps-mystudent" (also sanitises: no path traversal)
function units_slug($s) {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

function units_file($UNITS, $slug) {
    return $UNITS . '/' . $slug . '/answer-patterns.md';
}

// "**Automation Answer:** YES" → 'YES'; anything else / missing → 'NO'
function units_automation($content) {
    return preg_match('/^\*\*Automation Answer:\*\*\s*YES\b/mi', $content) ? 'YES' : 'NO';
}
function units_scope($content) {
    return preg_match('/^\*\*Automation Scope:\*\*\s*(.+)$/mi', $content, $m) ? trim($m[1]) : '';
}

// Replace the flag line, or insert it after the title block (heading + italic subtitle).
function units_set_automation($content, $value) {
    $line = '**Automation Answer:** ' . $value;
    if (preg_match('/^\*\*Automation Answer:\*\*.*$/mi', $content)) {
        return preg_replace('/^\*\*Automation Answer:\*\*.*$/mi', $line, $content, 1);
    }
    $lines = explode("\n", $content);
    $at = 0;
    foreach ($lines as $i => $l) { if (preg_match('/^#\s/', $l)) { $at = $i + 1; break; } }
    if (isset($lines[$at]) && preg_match('/^\*[^*]/', $lines[$at])) $at++;
    array_splice($lines, $at, 0, ['', $line]);
    return implode("\n", $lines);
}

function units_list($UNITS) {
    $out = [];
    foreach (glob($UNITS . '/*/answer-patterns.md') ?: [] as $f) {
        $content = (string) @file_get_contents($f);
        $title = preg_match('/^#\s+(.+)$/m', $content, $m) ? trim($m[1]) : basename(dirname($f));
        $out[] = ['slug' => basename(dirname($f)), 'title' => $title, 'content' => $content,
                  'automation' => units_automation($content), 'scope' => units_scope($content)];
    }
    usort($out, fn($a, $b) => strcasecmp($a['title'], $b['title']));
    return $out;
}

function units_fail($code, $msg) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? 'list';

if ($action === 'list') {
    echo json_encode(units_list($UNITS), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') units_fail(405, 'POST required');

if ($action === 'save') {
    $slug = units_slug($_POST['slug'] ?? '');
    $content = str_replace("\r\n", "\n", (string) ($_POST['content'] ?? ''));
    if ($slug === '' || !is_file(units_file($UNITS, $slug))) units_fail(404, 'unknown category');
    if (trim($content) === '') units_fail(400, 'content is empty');
    if (file_put_contents(units_file($UNITS, $slug), rtrim($content) . "\n", LOCK_EX) === false) units_fail(500, 'write failed');
    echo json_encode(['ok' => true, 'slug' => $slug]);
    exit;
}

if ($action === 'create') {
    $name = trim((string) ($_POST['name'] ?? ''));
    $slug = units_slug($name);
    if ($slug === '') units_fail(400, 'name is required');
    if (is_file(units_file($UNITS, $slug))) units_fail(409, 'category already exists');
    if (!is_dir($UNITS . '/' . $slug) && !mkdir($UNITS . '/' . $slug, 0775, true)) units_fail(500, 'mkdir failed');
    $title = strtoupper($name);
    $tpl = "# {$title}\n*UnITS category ID `?` · Sub categories: …*\n\n**Automation Answer:** NO\n\n"
         . "Default submit: Status `110` · Remark `Lain-lain.` · Aduan Type `122`\n\n"
         . "### A. `pattern-slug` — short description\n**Signals:** keywords seen in the complaint.\n> Answer text sent to the complainant.\n";
    if (file_put_contents(units_file($UNITS, $slug), $tpl, LOCK_EX) === false) units_fail(500, 'write failed');
    echo json_encode(['ok' => true, 'slug' => $slug]);
    exit;
}

if ($action === 'automation') {
    $slug = units_slug($_POST['slug'] ?? '');
    $value = strtoupper(trim((string) ($_POST['value'] ?? '')));
    if ($slug === '' || !is_file(units_file($UNITS, $slug))) units_fail(404, 'unknown category');
    if ($value !== 'YES' && $value !== 'NO') units_fail(400, 'value must be YES or NO');
    $content = str_replace("\r\n", "\n", (string) file_get_contents(units_file($UNITS, $slug)));
    if (file_put_contents(units_file($UNITS, $slug), units_set_automation($content, $value), LOCK_EX) === false) units_fail(500, 'write failed');
    echo json_encode(['ok' => true, 'slug' => $slug, 'automation' => $value]);
    exit;
}

units_fail(400, 'unknown action');
