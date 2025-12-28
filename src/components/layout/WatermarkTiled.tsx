import logo from "../../assets/Logo Partido Oxígeno CNE_1.png";

function Bloom({ className }: { className: string }) {
  return (
    <div className={["absolute -z-10 rounded-full blur-[120px] opacity-40", className].join(" ")} />
  );
}

export function WatermarkTiled() {
  const marks = [
    { left: "-5%", top: "-15%", w: 1600, op: 0.15 },
    { left: "26%", top: "5%", w: 1600, op: 0.15 },
    { left: "-10%", top: "54%", w: 1600, op: 0.15 },
  ] as const;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#F9FBFA]" />

      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 600px at 12% 12%, rgba(35,192,98,0.40), transparent 62%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 600px at 88% 90%, rgba(122,0,210,0.35), transparent 62%)",
        }}
      />

      <Bloom className="bg-[#23C062]/40 w-[680px] h-[680px] -top-[240px] -left-[240px]" />
      <Bloom className="bg-[#7A00D2]/35 w-[820px] h-[820px] -bottom-[320px] -right-[300px]" />
      <Bloom className="bg-blue-300/20 w-[520px] h-[520px] top-[38%] left-[16%]" />

      <div className="absolute inset-0">
        {marks.map((m, idx) => (
          <img
            key={idx}
            src={logo}
            alt=""
            className="absolute select-none"
            style={{
              left: m.left,
              top: m.top,
              width: `${m.w}px`,
              opacity: m.op,
              transform: "rotate(-14deg)",
              mixBlendMode: "multiply",
              filter: "saturate(0.9)",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-white/25" />
    </div>
  );
}
