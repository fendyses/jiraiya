<?php
session_start();

// ─────────────────────────────────────────────────────────────
//  JIRAIYA — login gate
//  Change the credentials below.
//  To set a new password, run:
//    php -r "echo password_hash('YOUR_NEW_PASSWORD', PASSWORD_DEFAULT);"
//  and paste the result into JIRAIYA_PASS_HASH.
// ─────────────────────────────────────────────────────────────
const JIRAIYA_USER      = 'fendy';
const JIRAIYA_PASS_HASH = '$2y$10$8vR5.w63TjWbODy7.tMUyedF2pW7DsLAfyJZRu5TLnH9ZdFQcpMNC'; // password: 199254

// Already authenticated → straight to the dashboard.
if (!empty($_SESSION['jiraiya_auth'])) {
    header('Location: agents/dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = trim($_POST['username'] ?? '');
    $p = (string) ($_POST['password'] ?? '');
    if (hash_equals(JIRAIYA_USER, $u) && password_verify($p, JIRAIYA_PASS_HASH)) {
        session_regenerate_id(true);
        $_SESSION['jiraiya_auth'] = true;
        $_SESSION['jiraiya_user'] = $u;
        header('Location: agents/dashboard.php');
        exit;
    }
    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JIRAIYA — Sign in</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      font-family:'Rajdhani',sans-serif;color:#fff;overflow:hidden;
      background:radial-gradient(circle at 30% 20%,#1a1130 0%,#0a0a18 45%,#05050f 100%);
    }
    /* drifting purple glow blobs */
    body::before,body::after{content:'';position:fixed;border-radius:50%;filter:blur(90px);opacity:.5;z-index:0}
    body::before{width:460px;height:460px;background:#7B2FFF;top:-120px;left:-100px;animation:float1 14s ease-in-out infinite}
    body::after{width:380px;height:380px;background:#3a1f7a;bottom:-120px;right:-80px;animation:float2 17s ease-in-out infinite}
    @keyframes float1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}
    @keyframes float2{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,-30px)}}

    .card{
      position:relative;z-index:1;width:340px;max-width:90vw;padding:38px 34px 32px;
      background:rgba(255,255,255,.035);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
      border:1px solid rgba(155,92,255,.25);border-radius:16px;
      box-shadow:0 20px 60px -20px rgba(123,47,255,.45),inset 0 0 30px -18px rgba(155,92,255,.6);
      text-align:center;
    }
    .logo{font-family:'Press Start 2P',monospace;font-size:20px;letter-spacing:2px;
      background:linear-gradient(180deg,#c9a8ff,#7B2FFF);-webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;text-shadow:0 0 24px rgba(123,47,255,.4);margin-bottom:6px}
    .tag{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;
      color:rgba(201,168,255,.6);margin-bottom:28px}
    .field{position:relative;margin-bottom:14px;text-align:left}
    .field label{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;
      color:rgba(255,255,255,.4);margin-bottom:6px;font-family:'Share Tech Mono',monospace}
    .field input{
      width:100%;padding:11px 13px;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;color:#fff;
      background:rgba(0,0,0,.35);border:1px solid rgba(155,92,255,.2);border-radius:9px;outline:none;
      transition:border-color .2s,box-shadow .2s;
    }
    .field input:focus{border-color:#9b5cff;box-shadow:0 0 0 3px rgba(123,47,255,.18)}
    .btn{
      width:100%;margin-top:8px;padding:12px;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:15px;
      letter-spacing:2px;text-transform:uppercase;color:#fff;cursor:pointer;border:none;border-radius:9px;
      background:linear-gradient(135deg,#7B2FFF,#5a1fd0);box-shadow:0 8px 22px -8px rgba(123,47,255,.8);
      transition:transform .12s,box-shadow .2s;
    }
    .btn:hover{transform:translateY(-1px);box-shadow:0 12px 28px -8px rgba(123,47,255,.95)}
    .btn:active{transform:translateY(0)}
    .err{
      margin-bottom:16px;padding:9px 12px;font-size:13px;font-weight:600;border-radius:8px;
      color:#ffb4b4;background:rgba(255,60,60,.1);border:1px solid rgba(255,60,60,.3);
    }
    .foot{margin-top:20px;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:1px;color:rgba(255,255,255,.25)}
  </style>
</head>
<body>
  <form class="card" method="post" autocomplete="off">
    <div class="logo">JIRAIYA</div>
    <div class="tag">Deep Insight &amp; Betterment</div>
    <?php if ($error): ?>
      <div class="err"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <div class="field">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" required autofocus value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required>
    </div>
    <button class="btn" type="submit">Enter</button>
    <div class="foot">⟡ Authorized access only ⟡</div>
  </form>
</body>
</html>
