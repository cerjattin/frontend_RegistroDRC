import axios from "axios";

const API = import.meta.env.VITE_API || "https://drcoxigeno.onrender.com";

export type Department = { name: string };

export type Municipality = { id: number; name: string };
export type Neighborhood = { id: number; name: string };
export type Leader = { id: number; name: string; coordinator_id?: number | null };

// ---------- helpers ----------
function asArray(data: any): any[] {
  return Array.isArray(data) ? data : [];
}

function normalizeDepartments(data: any): Department[] {
  const arr = asArray(data);
  if (arr.length === 0) return [];

  // backend actual: ["ATLANTICO", "BOLIVAR", ...]
  if (typeof arr[0] === "string") {
    return arr.map((name: string) => ({ name }));
  }

  // por si luego cambias a [{name:"ATLANTICO"}]
  return arr
    .filter((x) => x && typeof x === "object")
    .map((x) => ({ name: String(x.name ?? x.department ?? "").trim() }))
    .filter((x) => x.name.length > 0);
}

// ---------- API ----------
export async function getDepartments(): Promise<Department[]> {
  const { data } = await axios.get(`${API}/catalog/departments`);
  return normalizeDepartments(data);
}

export async function getMunicipalities(departmentName: string): Promise<Municipality[]> {
  const { data } = await axios.get(`${API}/catalog/municipalities`, {
    params: { department: departmentName },
  });

  return asArray(data)
    .filter((x) => x && typeof x === "object")
    .map((x) => ({ id: Number(x.id), name: String(x.name) }))
    .filter((x) => Number.isFinite(x.id) && x.name.length > 0);
}

export async function getNeighborhoods(municipalityId: number): Promise<Neighborhood[]> {
  const { data } = await axios.get(`${API}/catalog/neighborhoods`, {
    params: { municipality_id: municipalityId },
  });

  return asArray(data)
    .filter((x) => x && typeof x === "object")
    .map((x) => ({ id: Number(x.id), name: String(x.name) }))
    .filter((x) => Number.isFinite(x.id) && x.name.length > 0);
}

export async function getLeaders(): Promise<Leader[]> {
  const { data } = await axios.get(`${API}/catalog/leaders`);

  return asArray(data)
    .filter((x) => x && typeof x === "object")
    .map((x) => ({
      id: Number(x.id),
      name: String(x.name),
      coordinator_id: x.coordinator_id != null ? Number(x.coordinator_id) : null,
    }))
    .filter((x) => Number.isFinite(x.id) && x.name.length > 0);
}
