<?php
// ─────────────────────────────────────────────────────────────────────────
//  Shared auth/session bootstrap for the JIRAIYA dashboard (local ServBay).
//  Included by index.php, agents/dashboard.php, agents/system-stats.php,
//  and logout.php. Kept lean on purpose — this is a personal local app.
// ─────────────────────────────────────────────────────────────────────────

// Secure session cookie (HttpOnly + SameSite; Secure only when over HTTPS).
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
    session_start();
}

// Credentials live one level above the web root; see /Applications/Sites/.jiraiya-config.php
function jiraiya_config() {
    $f = dirname(__DIR__) . '/.jiraiya-config.php';
    return is_readable($f) ? require $f : ['user' => '', 'pass_hash' => ''];
}

function jiraiya_is_authed() {
    return !empty($_SESSION['jiraiya_auth']);
}

// Redirect to the login page unless already authenticated.
function jiraiya_require_auth($login_path) {
    if (!jiraiya_is_authed()) {
        header('Location: ' . $login_path);
        exit;
    }
}
