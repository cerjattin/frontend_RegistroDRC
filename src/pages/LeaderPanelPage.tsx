import { useMemo, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { WatermarkTiled } from "../components/layout/WatermarkTiled";
import { ENV } from "../config/env";
import { toast } from "sonner";
import { registerLeader } from "../services/register";

export default function LeaderPanelPage() {
  const defaultBaseUrl = `${window.location.origin}${ENV.BASENAME || "/"}`;

  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [leaderNameInput, setLeaderNameInput] = useState("");

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

  const handleCreateLeader = async () => {
    const name = leaderNameInput.trim();
    if (name.length < 2) {
      toast.error("Ingresa el nombre del líder.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerLeader({ name });

      setLeaderCode(String(res.leaderCode));
      setCoordCode(String(res.coordinatorCode));
      setLeaderName(res.leaderName || name);
      setCoordName(res.coordinatorName || null);

      toast.success("Líder creado. Link generado automáticamente.");
    } catch (e: any) {
      console.error("[LeaderPanel] Error creando líder:", e);
      const msg =
        e?.response?.data?.detail ||
        e?.detail ||
        e?.message ||
        "No se pudo crear el líder.";
      toast.error(String(msg));
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
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Panel de Líder</h1>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Crear líder y generar link</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nombre del líder</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={leaderNameInput}
                  onChange={(e) => setLeaderNameInput(e.target.value)}
                  placeholder="Ej: María Pérez"
                />
                <p className="mt-1 text-xs text-slate-500">
                  El coordinador se asigna automáticamente (configurado en el backend).
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">URL base del formulario</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">Normalmente será {defaultBaseUrl}</p>
            </div>

            <button
              type="button"
              onClick={handleCreateLeader}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear líder y generar link"}
            </button>
          </div>

          {finalLink && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
              <p className="text-sm font-semibold text-emerald-800">Link generado:</p>
              <p className="break-all text-sm text-emerald-900">{finalLink}</p>

              {(leaderName || coordName) && (
                <div className="text-sm text-emerald-900">
                  {leaderName && (
                    <p>
                      Líder: <span className="font-semibold">{leaderName}</span>
                    </p>
                  )}
                  {coordName && (
                    <p>
                      Coordinador: <span className="font-semibold">{coordName}</span>
                    </p>
                  )}
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

              <div className="pt-2 text-xs text-emerald-900/70">
                <p>
                  Códigos: líder <span className="font-semibold">{leaderCode}</span> · coordinador{" "}
                  <span className="font-semibold">{coordCode}</span>
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
