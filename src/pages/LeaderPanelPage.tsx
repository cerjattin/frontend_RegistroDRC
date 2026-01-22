import { useMemo, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { WatermarkTiled } from "../components/layout/WatermarkTiled";
import { ENV } from "../config/env";
import { toast } from "sonner";
import { createLeader, resolveLeaderLink } from "../services/register";

export default function LeaderPanelPage() {
  const defaultBaseUrl = `${window.location.origin}${ENV.BASENAME || "/"}`;

const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);

const [leaderId, setLeaderId] = useState("");
const [leaderNameInput, setLeaderNameInput] = useState("");
const [coordId, setCoordId] = useState(ENV.DEFAULT_COORDINATOR_ID || "");

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

const handleCreateAndGenerate = async () => {
  if (!leaderId || !leaderNameInput) {
    toast.error("Ingresa el ID y el nombre del líder.");
    return;
  }
  if (!/^[0-9]+$/.test(leaderId)) {
    toast.error("El ID del líder debe ser numérico.");
    return;
  }
  if (coordId && !/^[0-9]+$/.test(coordId)) {
    toast.error("El coordinator_id debe ser numérico.");
    return;
  }

  setLoading(true);
  try {
    const res = await createLeader({
      id: Number(leaderId),
      name: leaderNameInput,
      coordinator_id: coordId ? Number(coordId) : undefined,
    });

    if (!res.created) {
      // Si ya existe, igual intentamos resolver para mostrar nombres correctos
      toast.error(res.message || "El líder ya existe.");
    } else {
      toast.success("Líder creado correctamente.");
    }

    const lc = String(res.leaderCode ?? leaderId);
    const cc = String(res.coordinatorCode ?? coordId);
    setLeaderCode(lc);
    setCoordCode(cc);
    setLeaderName(res.leaderName || leaderNameInput);
    setCoordName(res.coordinatorName || null);

    // Validación final con la lógica existente (garantiza pertenencia)
    const vr = await resolveLeaderLink(lc, cc);
    if (!vr.valid) {
      toast.error(vr.message || "Enlace inválido.");
      return;
    }
    setLeaderName(vr.leaderName || res.leaderName || leaderNameInput);
    setCoordName(vr.coordinatorName || res.coordinatorName || null);
  } catch (e) {
    console.error("[LeaderPanel] Error creando líder:", e);
    toast.error("No se pudo crear el líder.");
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
            <h2 className="text-lg font-semibold">Registro de líder</h2>

              <div className="grid gap-4 md:grid-cols-2">
    <div>
      <label className="block text-sm font-medium mb-1">
        ID del líder
      </label>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={leaderId}
        onChange={(e) => setLeaderId(e.target.value)}
        placeholder="Ej: 12"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">
        coordinator_id (precargado)
      </label>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={coordId}
        onChange={(e) => setCoordId(e.target.value)}
        placeholder="Ej: 3"
      />
      <p className="mt-1 text-xs text-slate-500">
        Este valor viene por defecto, pero puedes ajustarlo si lo necesitas.
      </p>
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">
        Nombre del líder
      </label>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={leaderNameInput}
        onChange={(e) => setLeaderNameInput(e.target.value)}
        placeholder="Ej: Juan Pérez"
      />
    </div>
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
              onClick={handleCreateAndGenerate}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Crear líder y generar link"}
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
