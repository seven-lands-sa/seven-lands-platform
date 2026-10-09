$csharp = @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

public class DesktopLauncher {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct STARTUPINFO {
        public Int32 cb;
        public string lpReserved;
        public string lpDesktop;
        public string lpTitle;
        public Int32 dwX;
        public Int32 dwY;
        public Int32 dwXSize;
        public Int32 dwYSize;
        public Int32 dwXCountChars;
        public Int32 dwYCountChars;
        public Int32 dwFillAttribute;
        public Int32 dwFlags;
        public Int16 wShowWindow;
        public Int16 cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PROCESS_INFORMATION {
        public IntPtr hProcess;
        public IntPtr hThread;
        public Int32 dwProcessId;
        public Int32 dwThreadId;
    }

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CreateProcess(
        string lpApplicationName,
        string lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string lpCurrentDirectory,
        ref STARTUPINFO lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr hObject);

    public static int LaunchOnDefaultDesktop(string exePath, string args) {
        STARTUPINFO si = new STARTUPINFO();
        si.cb = Marshal.SizeOf(si);
        si.lpDesktop = @"winsta0\default";

        PROCESS_INFORMATION pi = new PROCESS_INFORMATION();
        string cmd = "\"" + exePath + "\" " + args;

        // 0x00000008 = DETACHED_PROCESS, 0x00000200 = CREATE_NEW_PROCESS_GROUP, 0x01000000 = CREATE_BREAKAWAY_FROM_JOB
        uint flags = 0x00000008 | 0x00000200 | 0x01000000;

        bool success = CreateProcess(null, cmd, IntPtr.Zero, IntPtr.Zero, false, flags, IntPtr.Zero, null, ref si, out pi);
        if (!success) {
            // fallback without breakaway if not permitted
            flags = 0x00000008 | 0x00000200;
            success = CreateProcess(null, cmd, IntPtr.Zero, IntPtr.Zero, false, flags, IntPtr.Zero, null, ref si, out pi);
            if (!success) return -Marshal.GetLastWin32Error();
        }

        if (pi.hProcess != IntPtr.Zero) CloseHandle(pi.hProcess);
        if (pi.hThread != IntPtr.Zero) CloseHandle(pi.hThread);

        return pi.dwProcessId;
    }
}
'@

Add-Type -TypeDefinition $csharp -Language CSharp

$exe = "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
$profile = "D:\seven-lands\browser-ops-profile"
$args = "--user-data-dir=`"$profile`" --remote-debugging-port=9222 --remote-allow-origins=* --start-maximized --no-first-run --no-default-browser-check https://github.com/seven-lands-sa"

Write-Output "Launching Brave detached on winsta0\default..."
$pidLaunched = [DesktopLauncher]::LaunchOnDefaultDesktop($exe, $args)
Write-Output "Launched process PID: $pidLaunched"

Start-Sleep -Seconds 4

try {
    $ver = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/version" -Method GET
    Write-Output "CDP Connected successfully!"
    $ver | ConvertTo-Json
} catch {
    Write-Output "CDP Error: $_"
}
