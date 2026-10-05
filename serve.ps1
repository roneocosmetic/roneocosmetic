param(
    [int]$Port = 8000
)

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$ip = [System.Net.IPAddress]::Any
$listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
$listener.Start()

Write-Output "=========================================================="
Write-Output "   SERVIDOR WEB RONEO BARBER ACTIVO EN TU RED WI-FI"
Write-Output "=========================================================="
Write-Output "  En tu PC:       http://localhost:$Port"
Write-Output "  En tu iPhone:   http://192.168.18.157:$Port"
Write-Output "=========================================================="

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 4000
        $stream.WriteTimeout = 4000

        try {
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
            $requestLine = $reader.ReadLine()

            if (-not [string]::IsNullOrWhiteSpace($requestLine)) {
                $parts = $requestLine.Split(" ")
                if ($parts.Length -ge 2) {
                    $url = $parts[1]
                    $queryIdx = $url.IndexOf("?")
                    if ($queryIdx -gt -1) { $url = $url.Substring(0, $queryIdx) }
                    if ($url -eq "/" -or [string]::IsNullOrWhiteSpace($url)) { $url = "/index.html" }

                    $rel = $url.TrimStart("/\").Replace("/", "\")
                    $filePath = Join-Path $root $rel

                    if (Test-Path $filePath -PathType Leaf) {
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                        $bytes = [System.IO.File]::ReadAllBytes($filePath)

                        $header = "HTTP/1.1 200 OK`r`n" +
                                  "Content-Type: $mime`r`n" +
                                  "Content-Length: $($bytes.Length)`r`n" +
                                  "Access-Control-Allow-Origin: *`r`n" +
                                  "Connection: close`r`n`r`n"

                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($bytes, 0, $bytes.Length)
                    } else {
                        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                        $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($msg.Length)`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($msg, 0, $msg.Length)
                    }
                }
            }
        } catch {
            # Ignore network resets / disconnects
        } finally {
            $stream.Flush()
            $stream.Close()
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
