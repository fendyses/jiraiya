<?php
// ─────────────────────────────────────────────────────────────────────────
//  ToDo API for the JIRAIYA dashboard. Auth-gated. Stores tasks in
//  main/todo.md (a .md file, so the nginx deny-rules keep it private).
//  Each task carries its created date; completed tasks also carry a done date.
//    Format:  ## Ongoing      → "- 2026-06-21 :: text"
//             ## Completed     → "- 2026-06-21 :: text :: 2026-06-22"
//
//    GET  ?action=list
//    POST action=add       text=...
//    POST action=update    i=<n>  text=...
//    POST action=delete    i=<n>
//    POST action=complete  i=<n>
//    POST action=restore   i=<n>   (completed → ongoing)
//    POST action=deldone   i=<n>   (remove a completed task)
// ─────────────────────────────────────────────────────────────────────────
require __DIR__ . '/../auth.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');
if (!jiraiya_is_authed()) { http_response_code(403); echo json_encode(['error' => 'unauthorized']); exit; }

$FILE = dirname(__DIR__) . '/main/todo.md';
$TODAY = date('Y-m-d');

function todo_load($file) {
    $content = is_readable($file) ? (string) file_get_contents($file)
        : "# ✅ ToDo\n*Task list managed from the dashboard*\n\n## Ongoing\n\n## Completed\n";
    $oPos = stripos($content, '## Ongoing');
    $cPos = stripos($content, '## Completed');
    $preamble = $oPos !== false ? substr($content, 0, $oPos) : "# ✅ ToDo\n*Task list managed from the dashboard*\n\n";
    $ongoingRaw = '';
    $completedRaw = '';
    if ($oPos !== false && $cPos !== false && $cPos > $oPos) {
        $ongoingRaw   = substr($content, $oPos + 10, $cPos - ($oPos + 10));
        $completedRaw = substr($content, $cPos + 12);
    } elseif ($oPos !== false) {
        $ongoingRaw = substr($content, $oPos + 10);
    }
    $ongoing = $completed = [];
    foreach (preg_split('/\R/', $ongoingRaw) as $ln) {
        if (preg_match('/^\s*-\s+(\d{4}-\d{2}-\d{2})\s*::\s*(.+?)\s*$/', $ln, $m))
            $ongoing[] = ['date' => $m[1], 'text' => $m[2]];
    }
    foreach (preg_split('/\R/', $completedRaw) as $ln) {
        if (preg_match('/^\s*-\s+(\d{4}-\d{2}-\d{2})\s*::\s*(.+?)\s*::\s*(\d{4}-\d{2}-\d{2})\s*$/', $ln, $m))
            $completed[] = ['date' => $m[1], 'text' => $m[2], 'done' => $m[3]];
    }
    return [$preamble, $ongoing, $completed];
}

function todo_save($file, $preamble, $ongoing, $completed) {
    $out = rtrim($preamble) . "\n\n## Ongoing\n\n";
    foreach ($ongoing as $t)  $out .= '- ' . $t['date'] . ' :: ' . $t['text'] . "\n";
    $out .= "\n## Completed\n\n";
    foreach ($completed as $t) $out .= '- ' . $t['date'] . ' :: ' . $t['text'] . ' :: ' . $t['done'] . "\n";
    file_put_contents($file, $out, LOCK_EX);
}

function todo_clean($s) {
    $s = trim((string) $s);
    $s = preg_replace('/\s+/', ' ', $s);
    $s = str_replace('::', '-', $s);          // '::' is the field separator
    $s = preg_replace('/^[-*]\s+/', '', $s);
    return mb_substr($s, 0, 300);
}

list($preamble, $ongoing, $completed) = todo_load($FILE);
$action = $_REQUEST['action'] ?? 'list';
$i = isset($_REQUEST['i']) ? (int) $_REQUEST['i'] : -1;
$dirty = false;

switch ($action) {
    case 'add':
        $t = todo_clean($_POST['text'] ?? '');
        if ($t !== '') { array_unshift($ongoing, ['date' => $TODAY, 'text' => $t]); $dirty = true; }
        break;
    case 'update':
        $t = todo_clean($_POST['text'] ?? '');
        if ($i >= 0 && $i < count($ongoing) && $t !== '') { $ongoing[$i]['text'] = $t; $dirty = true; }
        break;
    case 'delete':
        if ($i >= 0 && $i < count($ongoing)) { array_splice($ongoing, $i, 1); $dirty = true; }
        break;
    case 'complete':
        if ($i >= 0 && $i < count($ongoing)) {
            $task = $ongoing[$i]; $task['done'] = $TODAY;
            array_splice($ongoing, $i, 1); array_unshift($completed, $task); $dirty = true;
        }
        break;
    case 'restore':
        if ($i >= 0 && $i < count($completed)) {
            $task = ['date' => $completed[$i]['date'], 'text' => $completed[$i]['text']];
            array_splice($completed, $i, 1); array_unshift($ongoing, $task); $dirty = true;
        }
        break;
    case 'deldone':
        if ($i >= 0 && $i < count($completed)) { array_splice($completed, $i, 1); $dirty = true; }
        break;
}
if ($dirty) todo_save($FILE, $preamble, $ongoing, $completed);

echo json_encode(['ok' => true, 'ongoing' => array_values($ongoing), 'completed' => array_values($completed)]);
