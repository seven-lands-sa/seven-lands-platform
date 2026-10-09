$csharp = @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

public class WinInspector {
    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool CloseDesktop(IntPtr hDesktop);

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumWindowsProc lpfn, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);

    [DllImport("user32.dll")]
    static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    public static List<string> GetDefaultDesktopWindows() {
        var list = new List<string>();
        IntPtr hDesk = OpenDesktop("default", 0, false, 0x0100 | 0x0001);
        if (hDesk == IntPtr.Zero) {
            list.Add("Failed to open desktop: error " + Marshal.GetLastWin32Error());
            return list;
        }

        EnumDesktopWindows(hDesk, (hWnd, lParam) => {
            if (IsWindowVisible(hWnd)) {
                StringBuilder sb = new StringBuilder(256);
                GetWindowText(hWnd, sb, sb.Capacity);
                string title = sb.ToString();
                if (!string.IsNullOrWhiteSpace(title)) {
                    uint pid = 0;
                    GetWindowThreadProcessId(hWnd, out pid);
                    list.Add(pid + " | " + title);
                }
            }
            return true;
        }, IntPtr.Zero);

        CloseDesktop(hDesk);
        return list;
    }
}
'@

Add-Type -TypeDefinition $csharp -Language CSharp
[WinInspector]::GetDefaultDesktopWindows()
