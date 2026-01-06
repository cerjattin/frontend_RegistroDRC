import React, { useEffect, useMemo, useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import InputField from "../ui/InputField";
import SelectField from "../ui/SelectField";
import { TurnstileWidget } from "../form/TurnstileWidget";
import { toast } from "sonner";

import type { Department, Municipality, Neighborhood, Leader } from "../../services/catalogs";
import { getDepartments, getMunicipalities, getNeighborhoods, getLeaders } from "../../services/catalogs";
import { registerVoter, resolveLeaderLink } from "../../services/register";

type Opt = { value: string; label: string };

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  
  // captcha
  const [captchaToken, setCaptchaToken] = useState<string>("");

  // catalogs
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);

  // selections
  const [departmentValue, setDepartmentValue] = useState<string>("");
  const [municipalityValue, setMunicipalityValue] = useState<string>("");
  const [neighborhoodValue, setNeighborhoodValue] = useState<string>("");
  const [leaderValue, setLeaderValue] = useState<string>("");

  const location = useLocation();
  const navigate = useNavigate();

  const [linkChecked, setLinkChecked] = useState(false);
  const [linkValid, setLinkValid] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<{
    leaderCode: number;
    coordinatorCode: number;
    leaderName?: string;
    coordinatorName?: string;
  } | null>(null);

  // ------------ LOAD BASE CATALOGS (deps + leaders) ------------
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
       
        console.log("[RegisterForm] loading catalogs: departments + leaders...");
        const [deps, leadersData] = await Promise.all([getDepartments(), getLeaders()]);
        if (!alive) return;

        console.log("[RegisterForm] departments:", deps?.length ?? 0, "leaders:", leadersData?.length ?? 0);

        setDepartments(deps || []);
        setLeaders(leadersData || []);
      } catch (e) {
        console.error("[RegisterForm] Error cargando catálogos base:", e);
        toast.error("No se pudieron cargar los catálogos (departamentos/líderes).");
        if (!alive) return;
        setDepartments([]);
        setLeaders([]);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  // ------------ LEADER LINK FROM URL ------------
  useEffect(() => {
    console.log("[RegisterForm] pathname:", location.pathname);
    console.log("[RegisterForm] search:", location.search);

    const params = new URLSearchParams(location.search);
    const leaderParam = params.get("leader");
    const coordParam = params.get("coord");

    console.log("[RegisterForm] leaderParam:", leaderParam);
    console.log("[RegisterForm] coordParam:", coordParam);
    // Si faltan parámetros -> link inválido
    if (!leaderParam || !coordParam) {
      setLinkChecked(true);
      setLinkValid(false);
      setLinkError("Este enlace no es válido. Solicita el enlace a tu líder.");
      setLinkInfo(null);
      setLeaderValue("");
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await resolveLeaderLink(leaderParam, coordParam);
        if (!alive) return;

        if (!res.valid) {
          setLinkChecked(true);
          setLinkValid(false);
          setLinkError(
            res.message || "Enlace inválido o caducado. Solicita un nuevo enlace."
          );
          setLinkInfo(null);
          setLeaderValue("");
          return;
        }

        const leaderCode = res.leaderCode!;
        const coordinatorCode = res.coordinatorCode!;

        setLinkChecked(true);
        setLinkValid(true);
        setLinkError(null);

        setLinkInfo({
          leaderCode,
          coordinatorCode,
          leaderName: res.leaderName,
          coordinatorName: res.coordinatorName,
        });

        setLeaderValue(String(leaderCode));
      } catch (e) {
        console.error("[RegisterForm] Error resolviendo link:", e);
        if (!alive) return;

        setLinkChecked(true);
        setLinkValid(false);
        setLinkError(
          "No se pudo validar el enlace. Intenta de nuevo o solicita uno nuevo a tu líder."
        );
        setLinkInfo(null);
        setLeaderValue("");
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.search]);

  // ------------ DEPARTMENT -> MUNICIPALITIES ------------
  useEffect(() => {
    let alive = true;

    const run = async () => {
      // reset hijos siempre que cambie el depto
      setMunicipalities([]);
      setMunicipalityValue("");
      setNeighborhoods([]);
      setNeighborhoodValue("");

      if (!departmentValue) return;

      try {
        console.log("[RegisterForm] loading municipalities for department:", departmentValue);
        const rows = await getMunicipalities(departmentValue);
        if (!alive) return;

        console.log("[RegisterForm] municipalities:", rows?.length ?? 0);
        setMunicipalities(rows || []);
      } catch (e) {
        console.error("[RegisterForm] Error cargando municipios:", e);
        toast.error("No se pudieron cargar los municipios.");
        if (!alive) return;
        setMunicipalities([]);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [departmentValue]);

  // ------------ MUNICIPALITY -> NEIGHBORHOODS ------------
  useEffect(() => {
    let alive = true;

    const run = async () => {
      // reset barrio siempre que cambie municipio
      setNeighborhoods([]);
      setNeighborhoodValue("");

      if (!municipalityValue) return;

      try {
        const muniId = Number(municipalityValue);
        console.log("[RegisterForm] loading neighborhoods for municipality:", muniId);

        const hoods = await getNeighborhoods(muniId);
        if (!alive) return;

        console.log("[RegisterForm] neighborhoods:", hoods?.length ?? 0);
        setNeighborhoods(hoods || []);
      } catch (e) {
        console.error("[RegisterForm] Error cargando barrios:", e);
        toast.error("No se pudieron cargar los barrios.");
        if (!alive) return;
        setNeighborhoods([]);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [municipalityValue]);

  // ------------ OPTIONS ------------
  const departmentOptions: Opt[] = useMemo(
    () => departments.map((d) => ({ value: String(d.name), label: d.name })),
    [departments]
  );

  const municipalityOptions: Opt[] = useMemo(
    () => municipalities.map((m) => ({ value: String(m.id), label: m.name })),
    [municipalities]
  );

  const neighborhoodOptions: Opt[] = useMemo(
    () => neighborhoods.map((n) => ({ value: String(n.id), label: n.name })),
    [neighborhoods]
  );

  const leaderOptions: Opt[] = useMemo(
    () => leaders.map((l) => ({ value: String(l.id), label: l.name })),
    [leaders]
  );

  // ------------ PLACEHOLDERS INTELIGENTES ------------
  const municipalityPlaceholder = useMemo(() => {
    if (!departmentValue) return "Selecciona primero un departamento";
    if (departmentValue && municipalities.length === 0) return "No hay municipios para este departamento";
    return "Selecciona tu ciudad";
  }, [departmentValue, municipalities.length]);

  const neighborhoodPlaceholder = useMemo(() => {
    if (!municipalityValue) return "Selecciona primero un municipio";
    if (municipalityValue && neighborhoods.length === 0) return "No hay barrios para este municipio";
    return "Selecciona tu barrio";
  }, [municipalityValue, neighborhoods.length]);

  // ------------ HANDLERS ------------
  const onInvalid = (e: React.InvalidEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toast.error("Por favor completa todos los campos requeridos.");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("[RegisterForm] submit fired ✅");

    // ✅ si algún required/pattern está bloqueando, lo mostramos
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      console.warn("[RegisterForm] checkValidity() failed ❌");
      form.reportValidity();
      toast.error("Revisa los campos requeridos.");
      return;
    }

    if (!captchaToken) {
      console.warn("[RegisterForm] captchaToken missing ❌");
      toast.error("Por favor completa el captcha.");
      return;
    }

    // validaciones para evitar enviar 0/vacíos
    if (!departmentValue) {
      toast.error("Selecciona un departamento.");
      return;
    }
    if (!municipalityValue) {
      toast.error("Selecciona un municipio.");
      return;
    }
    if (!neighborhoodValue) {
      toast.error("Selecciona un barrio.");
      return;
    }

    if (!linkChecked || !linkValid) {
      toast.error(
        linkError || "Este enlace no es válido. Solicita el enlace a tu líder."
      );
      return;
    }

    if (!leaderValue) {
      toast.error(
        "No se pudo determinar el líder asociado al enlace. Solicita un nuevo enlace."
      );
      return;
    }

    const fd = new FormData(form);

    const payload = {
      document: String(fd.get("document") || "").trim(),
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      address: String(fd.get("address") || "").trim(),

      municipality_id: Number(municipalityValue),
      neighborhood_id: Number(neighborhoodValue),
      leader_id: Number(leaderValue),

      coordinator_id: linkInfo?.coordinatorCode,

      consent: true,
      captcha_token: captchaToken,
    };

    console.log("[RegisterForm] payload:", payload);

    setLoading(true);
    try {
      const res = await registerVoter(payload);
      console.log("[RegisterForm] registerVoter response ✅", res);

      toast.success("✅ Registro completado correctamente.");
      navigate("/gracias", { replace: true });
      form.reset();

      // reset selects (menos el líder que viene del link)
      setDepartmentValue("");
      setMunicipalityValue("");
      setNeighborhoodValue("");
      setCaptchaToken("");
    } catch (err: any) {
      console.error("[RegisterForm] registerVoter error ❌", err);

      const msg =
        err?.response?.data?.detail ||
        err?.detail ||
        err?.message ||
        "Ocurrió un error registrando. Intenta de nuevo.";

      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} onInvalid={onInvalid}>
      {/* Info del enlace de líder/coordinador */}
      {linkChecked && linkValid && linkInfo && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 px-4 py-3 flex flex-col gap-1">
          <p className="text-sm font-semibold text-emerald-800">
            Registro asignado por:
          </p>
          <p className="text-sm text-emerald-900">
            Líder:{' '}
            <span className="font-semibold">
              {linkInfo.leaderName || `ID ${linkInfo.leaderCode}`}
            </span>
          </p>
          <p className="text-sm text-emerald-900">
            Coordinador:{' '}
            <span className="font-semibold">
              {linkInfo.coordinatorName || `ID ${linkInfo.coordinatorCode}`}
            </span>
          </p>
        </div>
      )}

      {linkChecked && !linkValid && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">
            {linkError || "Este enlace no es válido. Solicita el enlace a tu líder."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField label="Nombres" icon="person" name="first_name" placeholder="Juan" />
        <InputField label="Apellidos" icon="badge" name="last_name" placeholder="Pérez" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField
          label="Documento de Identidad"
          icon="branding_watermark"
          name="document"
          placeholder="123456789"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
        />
        <InputField
          label="Teléfono / Celular"
          icon="smartphone"
          name="phone"
          placeholder="3001234567"
          type="tel"
          inputMode="numeric"
          pattern="[0-9+ ]*"
          required
        />
      </div>

      {/* Departamentos / Municipio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectField
          label="Departamento"
          icon="map"
          name="department"
          placeholder={departments.length ? "Selecciona tu departamento" : "Cargando departamentos..."}
          options={departmentOptions}
          value={departmentValue}
          onChange={setDepartmentValue}
          disabled={departments.length === 0}
        />

        <SelectField
          label="Ciudad / Municipio"
          icon="location_city"
          name="municipality_id"
          placeholder={municipalityPlaceholder}
          options={municipalityOptions}
          value={municipalityValue}
          onChange={setMunicipalityValue}
          disabled={!departmentValue}
        />
      </div>

      {/* Barrio / Líder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectField
          label="Barrio"
          icon="holiday_village"
          name="neighborhood_id"
          placeholder={neighborhoodPlaceholder}
          options={neighborhoodOptions}
          value={neighborhoodValue}
          onChange={setNeighborhoodValue}
          disabled={!municipalityValue}
        />

        {/* El líder viene del enlace y no es editable, pero lo mostramos bloqueado */}
        <SelectField
          label="Líder"
          icon="diversity_3"
          name="leader_id"
          placeholder={leaders.length ? "Selecciona un líder" : "Cargando líderes..."}
          options={leaderOptions}
          value={leaderValue}
          onChange={setLeaderValue}
          disabled={leaderOptions.length === 0 || !linkValid}
        />
      </div>

      <InputField
        label="Dirección de Residencia"
        icon="home_pin"
        name="address"
        placeholder="Calle 123 # 45 - 67"
        required
      />

      {/* Consentimiento */}
      <div className="mt-2 flex items-start gap-3 rounded-xl border border-[#D6E9DD] bg-[#F4FBF6] px-4 py-3">
        <input
          id="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-[#23C062] text-[#23C062]"
        />
        <label htmlFor="consent" className="text-sm text-[#54926D] leading-6">
          Acepto la{" "}
          <a className="font-semibold text-[#23C062] hover:text-[#7A00D2] hover:underline transition" href="#">
            política de tratamiento de datos personales
          </a>
          . Entiendo que mis datos serán usados para fines de comunicación política del movimiento Oxígeno.
        </label>
      </div>

      {/* Turnstile */}
      <div className="mt-2">
        <TurnstileWidget onToken={setCaptchaToken} />
      </div>

      <button
        type="submit"
        disabled={loading || !linkValid}
        className="
          mt-4 w-full inline-flex items-center justify-center gap-2
          rounded-xl py-4 px-5
          text-base font-bold text-white
          bg-gradient-to-r from-[#23C062] to-[#23C062]
          shadow-md hover:shadow-lg
          transition active:scale-[0.99]
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {loading ? "Enviando..." : "Quiero ser parte"}
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </form>
  );
}
