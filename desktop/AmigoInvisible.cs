// Lanzador de escritorio: abre la app web en una ventana propia (modo aplicación de Edge),
// sin barras de navegador. Si Edge no está disponible, la abre en el navegador predeterminado.
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

[assembly: AssemblyTitle("Amigo Invisible")]
[assembly: AssemblyProduct("Amigo Invisible")]
[assembly: AssemblyDescription("Sorteo de amigo invisible con perfiles y recomendaciones")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

static class Program
{
    const string AppUrl = "https://amigo-invisible-1w5pe.web.app/";

    [STAThread]
    static void Main()
    {
        string[] candidates =
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
        };

        foreach (var edge in candidates)
        {
            if (!File.Exists(edge)) continue;
            Process.Start(new ProcessStartInfo(edge, "--app=\"" + AppUrl + "\" --window-size=1280,860") { UseShellExecute = false });
            return;
        }

        Process.Start(new ProcessStartInfo(AppUrl) { UseShellExecute = true });
    }
}
