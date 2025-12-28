import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { WatermarkTiled } from "../components/layout/WatermarkTiled";

export function ThankYouPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen text-[#0F1A13] font-sans">
      <WatermarkTiled />
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="bg-white/70 rounded-2xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-8 md:p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#23C062]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#23C062]">check_circle</span>
          </div>

          <h1 className="mt-4 text-2xl md:text-3xl font-black">
            ¡Registro recibido!
          </h1>
          <p className="mt-3 text-[#54926D]">
            Gracias por ser parte del movimiento. Tu información quedó registrada correctamente.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => nav("/")}
              className="
                inline-flex items-center justify-center
                rounded-xl px-6 py-3
                bg-white/70 border border-[#D2E5D9]
                font-semibold text-sm
                hover:bg-white transition
              "
            >
              Volver al formulario
            </button>

            <button
              type="button"
              onClick={() => window.open("#", "_blank")}
              className="
                inline-flex items-center justify-center
                rounded-xl px-6 py-3
                bg-gradient-to-r from-[#23C062] to-[#7A00D2]
                text-white font-semibold text-sm
                shadow-sm hover:shadow-md transition
              "
            >
              Conocer más
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
