import React, { useEffect, useMemo, useState } from "react";
import InputField from "../ui/InputField";
import SelectField from "../ui/SelectField";
import { TurnstileWidget } from "../form/TurnstileWidget";
import { toast } from "sonner";

import type { Department, Municipality, Neighborhood, Leader } from "../../services/catalogs";
import { getDepartments, getMunicipalities, getNeighborhoods, getLeaders } from "../../services/catalogs";
import { registerVoter } from "../../services/register";

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

  // ------------ LOAD BASE CATALOGS (deps + leaders) ------------
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        console.log("[RegisterForm] VITE_API =", import.meta.env.VITE_API);

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
        console.error("[RegisterForm] Error municipios:", e);
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
        console.error("[RegisterForm] Error barrios:", e);
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
    () => departments.map((d) => ({ value: d.name, label: d.name })),
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

  // ✅ Detecta validación HTML bloqueando submit
  const onInvalid = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const invalid = form.querySelector(":invalid") as HTMLElement | null;
    console.warn("[RegisterForm] Form invalid, first invalid:", invalid);
  };

  // ------------ SUBMIT ------------
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
    if (!leaderValue) {
      toast.error("Selecciona un líder.");
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

      consent: true,
      captcha_token: captchaToken,
    };

    console.log("[RegisterForm] payload:", payload);

    setLoading(true);
    try {
      const res = await registerVoter(payload);
      console.log("[RegisterForm] registerVoter response ✅", res);

      toast.success("✅ Registro completado correctamente.");
      form.reset();

      // reset selects
      setDepartmentValue("");
      setMunicipalityValue("");
      setNeighborhoodValue("");
      setLeaderValue("");
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

        <SelectField
          label="Líder"
          icon="diversity_3"
          name="leader_id"
          placeholder={leaders.length ? "Selecciona un líder" : "Cargando líderes..."}
          options={leaderOptions}
          value={leaderValue}
          onChange={setLeaderValue}
          disabled={leaderOptions.length === 0}
        />
      </div>

      <InputField
        label="Dirección de Residencia"
        icon="home_pin"
        name="address"
        placeholder="Calle 123 # 45 - 67"
        required
      />

      {/* Consent */}
      <div className="flex items-start gap-3 mt-2">
        <input
          className="mt-1 h-5 w-5 rounded border-gray-300 text-[#23C062] focus:ring-[#23C062]"
          id="consent"
          name="consent"
          type="checkbox"
          required
          defaultChecked
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
        disabled={loading}
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
