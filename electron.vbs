Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "electron " & WshShell.CurrentDirectory & "\src", vbhide
