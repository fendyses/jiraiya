<?php
// ─────────────────────────────────────────────────────────────────────────
//  ToDo API for the JIRAIYA dashboard. Auth-gated. Per-repo tasks.
//
//  Tasks live in each repo's file:
//    projects/<slug>/todo.md      (repo-scoped)
//    main/todo.md                 (the "global" bucket, unassigned tasks)
//  Each carries its created date; completed tasks also carry a done date.
//    Format:  ## Ongoing   → "- 2026-06-21 :: text"
//             ## Completed  → "- 2026-06-21 :: text :: 2026-06-22"
//
//  Every response returns the AGGREGATED view across all repos. Each item
//  carries { repo, ri } where `ri` is its index within that repo's file.
//  Mutations target one repo file via `repo` + `i` (=ri).
//
//    GET  ?action=list
//    POST action=add       text=...  [repo=<slug>]   (default: active repo)
//    POST action=update    repo=<slug> i=<ri>  text=...
//    POST action=delete    repo=<slug> i=<ri>
//    POST action=complete  repo=<slug> i=<ri>
//    POST action=restore   repo=<slug> i=<ri>   (completed → ongoing)
//    POST action=deldone   repo=<slug> i=<ri>   (remove a completed task)
// ─────────────────────────────────────────────────────────────────────────
require __DIR__ . '/../auth.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');
if (!jiraiya_is_authed()) { http_response_code(403); echo json_encode(['error' => 'unauthorized']); exit; }

$ROOT  = dirname(__DIR__);
$TODAY = date('Y-m-d');

// ── Repo → file resolution ────────────────────────────────────────────────
function todo_repo_file($ROOT, $slug) {
    if ($slug === 'global' || $slug === '') return $ROOT . '/main/todo.md';
    $slug = preg_replace('/[^a-z0-9._-]/i', '', $slug);   // no path traversal
    return $ROOT . '/projects/' . $slug . '/todo.md';
}

// Active repo slug from main/repos.md → ## Active Repo → **Path**: basename.
function todo_active_slug($ROOT) {
    $repos = @file_get_contents($ROOT . '/main/repos.md');
    if ($repos && preg_match('/##\s*Active Repo(.*?)(?:\n##\s|\z)/s', $repos, $m)
              && preg_match('/\*\*Path\*\*:\s*(.+)/', $m[1], $p)) {
        return strtolower(basename(trim($p[1])));
    }
    return 'global';
}

// All repo slugs that have a todo.md, plus the global bucket.
function todo_all_slugs($ROOT) {
    $slugs = [];
    foreach (glob($ROOT . '/projects/*/todo.md') ?: [] as $f) $slugs[] = basename(dirname($f));
    sort($slugs);
    $slugs[] = 'global';
    return array_values(array_unique($slugs));
}

function todo_load($file) {
    $content = is_readable($file) ? (string) file_get_contents($file)
        : "# ✅ ToDo\n\n## Ongoing\n\n## Completed\n";
    $oPos = stripos($content, '## Ongoing');
    $cPos = stripos($content, '## Completed');
    $preamble = $oPos !== false ? substr($content, 0, $oPos) : "# ✅ ToDo\n\n";
    $ongoingRaw = $completedRaw = '';
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
    if (!is_dir(dirname($file))) @mkdir(dirname($file), 0775, true);
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

// Aggregate every repo file into one view, tagging repo + repo-local index.
function todo_aggregate($ROOT) {
    $ongoing = $completed = [];
    foreach (todo_all_slugs($ROOT) as $slug) {
        list(, $ong, $comp) = todo_load(todo_repo_file($ROOT, $slug));
        foreach ($ong as $ri => $t)  { $t['repo'] = $slug; $t['ri'] = $ri; $ongoing[]   = $t; }
        foreach ($comp as $ri => $t) { $t['repo'] = $slug; $t['ri'] = $ri; $completed[] = $t; }
    }
    usort($ongoing,   fn($a, $b) => strcmp($b['date'], $a['date']));
    usort($completed, fn($a, $b) => strcmp($b['done'], $a['done']));
    return [$ongoing, $completed];
}

// ── Handle the request ────────────────────────────────────────────────────
$action = $_REQUEST['action'] ?? 'list';
$i      = isset($_REQUEST['i']) ? (int) $_REQUEST['i'] : -1;
$active = todo_active_slug($ROOT);

if ($action !== 'list') {
    // Mutations target a single repo file.
    $repo = $_REQUEST['repo'] ?? '';
    if ($repo === '' && $action === 'add') $repo = $active;   // add defaults to active repo
    $file = todo_repo_file($ROOT, $repo);
    list($preamble, $ongoing, $completed) = todo_load($file);
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
    if ($dirty) todo_save($file, $preamble, $ongoing, $completed);
}

list($ongoing, $completed) = todo_aggregate($ROOT);
echo json_encode([
    'ok'        => true,
    'ongoing'   => array_values($ongoing),
    'completed' => array_values($completed),
    'active'    => $active,
    'repos'     => todo_all_slugs($ROOT),
]);
