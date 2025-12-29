import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { WatermarkTiled } from "../components/layout/WatermarkTiled";
import RegisterForm from "../components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen text-[#0F1A13] font-sans">
      <WatermarkTiled />
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <section className="text-center mt-4 md:mt-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            La política en Colombia <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#23C062] via-emerald-500 to-[#7A00D2]">
              Necesita Oxígeno.
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-[#54926D] max-w-2xl mx-auto">
            Regístrate y sé parte del movimiento que transforma el país con transparencia,
            tecnología y acción ciudadana real.
          </p>
        </section>

        <section className="mt-10">
          <div className="bg-white/70 rounded-2xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.10)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-2 p-6 md:p-10 lg:p-12">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-br from-[#23C062] to-[#7A00D2]">
                    app_registration
                  </span>
                  <h3 className="text-xl font-bold">Regístrate ahora</h3>
                </div>

                <RegisterForm />
              </div>

              {/* tu aside/beneficios puede quedar igual que lo tienes */}
              <aside className="hidden md:flex md:col-span-1 p-10 border-l border-[#D2E5D9]/30 bg-white/25 relative">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#23C062] via-[#7A00D2] to-transparent" />
                <div className="relative z-10 flex flex-col gap-6">
                  <div>
                    <h4 className="font-bold">Datos Seguros</h4>
                    <p className="text-sm text-[#54926D] mt-1 leading-relaxed">
                      Tus datos están protegidos. Cumplimos con la ley de protección de datos.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold">Impacto Real</h4>
                    <p className="text-sm text-[#54926D] mt-1 leading-relaxed">
                      Al registrarte, tu información ayuda a organizar y fortalecer comunidades locales.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold">Comunidad Activa</h4>
                    <p className="text-sm text-[#54926D] mt-1 leading-relaxed">
                      Únete a miles de personas que están trabajando activamente para hacer un gran cambio.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
