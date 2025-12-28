import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  label: string;
  value: number;
};

export function SearchSelect({
  label,
  icon,
  placeholder,
  value,
  onChange,
  loadOptions,
  disabled,
}: {
  label: string;
  icon: string;
  placeholder: string;
  value: Option | null;
  onChange: (v: Option | null) => void;
  loadOptions: (q: string) => Promise<Option[]>;
  disabled?: boolean;
}) {
  const [q, setQ] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQ(value?.label ?? "");
  }, [value?.label]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const debouncedQuery = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    const run = async () => {
      setErr(null);
      setLoading(true);
      try {
        const data = await loadOptions(debouncedQuery.length < 2 ? "" : debouncedQuery);
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error cargando opciones");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [debouncedQuery, open, loadOptions]);

  return (
    <div className="relative" ref={wrapRef}>
      <label className="flex flex-col">
        <span className="text-sm font-medium text-[#0F1A13] mb-2">{label}</span>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#54926D] text-[20px]">
            {icon}
          </span>

          <input
            disabled={disabled}
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              onChange(null); // si cambia texto, se “desselecciona” hasta elegir
            }}
            placeholder={placeholder}
            className="
              w-full h-12 md:h-14
              rounded-xl border border-[#D2E5D9]
              bg-white/70
              pl-11 pr-10
              text-[#0F1A13] placeholder:text-[#54926D]/60
              focus:outline-none focus:ring-2 focus:ring-[#7A00D2]/20 focus:border-[#7A00D2]
              transition disabled:opacity-60
            "
          />

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-black/5"
            onClick={() => setOpen((s) => !s)}
            aria-label="Abrir"
          >
            <span className="material-symbols-outlined text-[#54926D]">expand_more</span>
          </button>
        </div>
      </label>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[#D2E5D9] bg-white shadow-lg overflow-hidden">
          <div className="px-4 py-3 text-xs text-[#54926D] flex items-center justify-between">
            <span>{loading ? "Buscando..." : "Selecciona una opción"}</span>
            {err ? <span className="text-red-600">{err}</span> : null}
          </div>

          <div className="max-h-56 overflow-auto">
            {!loading && items.length === 0 ? (
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm text-[#54926D] hover:bg-black/5"
                onClick={() => setOpen(false)}
              >
                No hay resultados
              </button>
            ) : (
              items.map((it) => (
                <button
                  key={it.value}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-[#0F1A13] hover:bg-black/5"
                  onClick={() => {
                    onChange(it);
                    setQ(it.label);
                    setOpen(false);
                  }}
                >
                  {it.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
