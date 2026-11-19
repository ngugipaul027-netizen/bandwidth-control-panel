<?php
/**
 * TEMPORARY — upload next to index.php, open in browser, then DELETE.
 * Shows why download.php returns HTTP 500 (Live mode hides errors).
 */
header('Content-Type: text/plain; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

echo "PHP " . PHP_VERSION . "\n";
echo "cwd=" . getcwd() . "\n";
echo "docroot files: download.php=" . (is_file(__DIR__ . '/download.php') ? 'yes' : 'no');
echo " init.php=" . (is_file(__DIR__ . '/init.php') ? 'yes' : 'no');
echo " config.php=" . (is_file(__DIR__ . '/config.php') ? 'yes' : 'no');
echo " controllers/download.php=" . (is_file(__DIR__ . '/system/controllers/download.php') ? 'yes' : 'no');
echo " plugin/download.php=" . (is_file(__DIR__ . '/system/plugin/download.php') ? 'yes' : 'no') . "\n\n";

$target = __DIR__ . '/download.php';
if (!is_file($target)) {
    echo "FAIL: download.php missing\n";
    exit;
}

echo "--- including download.php (errors below) ---\n";
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        echo "\nFATAL: {$e['message']}\nFILE: {$e['file']}:{$e['line']}\n";
    }
});

// Capture output so a successful script still shows something here.
ob_start();
try {
    include $target;
} catch (Throwable $t) {
    echo "THROWABLE: " . $t->getMessage() . "\n" . $t->getFile() . ':' . $t->getLine() . "\n";
    echo $t->getTraceAsString() . "\n";
}
$out = ob_get_clean();
echo "output_bytes=" . strlen($out) . "\n";
if ($out !== '') {
    echo "--- first 500 chars of output ---\n";
    echo substr($out, 0, 500) . "\n";
}
echo "\nDONE — delete this diagnose file from the server.\n";
