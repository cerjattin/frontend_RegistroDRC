import { useMemo, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { WatermarkTiled } from "../components/layout/WatermarkTiled";
import { ENV } from "../config/env";
import { toast } from "sonner";
import { resolveLeaderLink } from "../services/register";

export default function LeaderPanelPage() {
  const defaultBaseUrl = `${window.location.origin}${ENV.BASENAME || "/"}`;

  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [leaderCode, setLeaderCode] = useState("");
  const [coordCode, setCoordCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [leaderName, setLeaderName] = useState<string | null>(null);
  const [coordName, setCoordName] = useState<string | null>(null);

  const finalLink = useMemo(() => {
    if (!leaderCode || !coordCode) return "";
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("leader", leaderCode);
      url.searchParams.set("coord", coordCode);
      return url.toString();
    } catch {
      return "";
    }
  }, [baseUrl, leaderCode, coordCode]);

  const handleValidateAndGenerate = async () => {
    if (!leaderCode || !coordCode) {
      toast.error("Ingresa el código de líder y coordinador.");
      return;
    }
    setLoading(true);
    try {
      const res = await resolveLeaderLink(leaderCode, coordCode);
      if (!res.valid) {
        toast.error(res.message || "Enlace inválido.");
        setLeaderName(null);
        setCoordName(null);
        return;
      }
      setLeaderName(res.leaderName || `ID ${res.leaderCode}`);
      setCoordName(res.coordinatorName || `ID ${res.coordinatorCode}`);
      toast.success("Link validado correctamente. Puedes copiarlo o abrirlo.");
    } catch (e) {
      console.error("[LeaderPanel] Error resolviendo link:", e);
      toast.error("No se pudo validar el link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!finalLink) {
      toast.error("No hay link generado.");
      return;
    }
    try {
      await navigator.clipboard.writeText(finalLink);
      toast.success("Link copiado al portapapeles.");
    } catch {
      toast.error("No se pudo copiar el link.");
    }
  };

  const handleOpen = () => {
    if (!finalLink) {
      toast.error("No hay link generado.");
      return;
    }
    window.open(finalLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen text-[#0F1A13] font-sans">
      <WatermarkTiled />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">
          Panel de Líder
        </h1>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Datos del líder</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Código de líder (ID)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={leaderCode}
                  onChange={(e) => setLeaderCode(e.target.value)}
                  placeholder="Ej: 12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Código de coordinador (ID)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={coordCode}
                  onChange={(e) => setCoordCode(e.target.value)}
                  placeholder="Ej: 3"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                URL base del formulario
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Normalmente será {defaultBaseUrl}
              </p>
            </div>

            <button
              type="button"
              onClick={handleValidateAndGenerate}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Validando..." : "Validar y generar link"}
            </button>
          </div>

          {finalLink && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
              <p className="text-sm font-semibold text-emerald-800">
                Link generado:
              </p>
              <p className="break-all text-sm text-emerald-900">{finalLink}</p>

              {leaderName && coordName && (
                <div className="text-sm text-emerald-900">
                  <p>
                    Líder: <span className="font-semibold">{leaderName}</span>
                  </p>
                  <p>
                    Coordinador: <span className="font-semibold">{coordName}</span>
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Copiar
                </button>
                <button
                  type="button"
                  onClick={handleOpen}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Abrir en nueva pestaña
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
