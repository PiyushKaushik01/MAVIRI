"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export type PokedexMode = "auth";

type PokedexProps = {
  open: boolean;
  onClose: () => void;
  mode?: PokedexMode;
};

export function Pokedex({ open, onClose, mode = "auth" }: PokedexProps) {
  const [isOpen, setIsOpen] = useState(false); // Controls the 3D fold
  const [bootState, setBootState] = useState<"boot" | "form" | "busy" | "ok" | "err">("boot");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [showPass, setShowPass] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("AWAITING INPUT_");

  // 3D Tilt & Scale refs
  const tiltRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);

  // Initialize open sequence
  useEffect(() => {
    if (open) {
      setTimeout(() => setIsOpen(true), 300);
      setTimeout(() => setBootState("form"), 2600); // Boot sequence length
    } else {
      setIsOpen(false);
      setBootState("boot");
      setAuthMode("signup");
      setName("");
      setEmail("");
      setPass("");
      setErrorMsg("AWAITING INPUT_");
    }
  }, [open]);

  // Handle 3D tilt on mouse move
  useEffect(() => {
    if (!open) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!tiltRef.current) return;
      const rx = -((e.clientY / window.innerHeight - 0.5) * 7);
      const ry = ((e.clientX / window.innerWidth - 0.5) * 10);

      // Snap to 1.5deg increments for retro feel
      const snapRx = Math.round(rx / 1.5) * 1.5;
      const snapRy = Math.round(ry / 1.5) * 1.5;

      tiltRef.current.style.transform = `rotateX(${snapRx}deg) rotateY(${snapRy}deg)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [open]);

  // Handle resize/scale
  useEffect(() => {
    const handleResize = () => {
      if (!rigRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const narrow = w < 760;

      const targetW = narrow ? 364 : 700;
      const targetH = 590;
      const scale = Math.min(1, (w - 24) / targetW, (h - 24) / targetH);
      const safeScale = Math.max(0.4, scale);

      rigRef.current.style.setProperty("--s", safeScale.toFixed(3));
      rigRef.current.style.setProperty("--sh", narrow ? "0px" : "170px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  const switchMode = (m: "signup" | "login") => {
    setAuthMode(m);
    setErrorMsg("AWAITING INPUT_");
    setBootState("form");
  };

  // components/pokedex/pokedex.tsx
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setBootState("busy");
    setErrorMsg("CONNECTING...");

    const isSignup = authMode === "signup";
    let result;

    try {
      if (isSignup) {
        result = await authClient.signUp.email({
          email,
          password: pass,
          name: name,
          callbackURL: "/auth/verify-email", // <-- Crucial: Tells Better Auth where to redirect
        });
      } else {
        result = await authClient.signIn.email({
          email,
          password: pass,
        });
      }

      if (result.error) {
        setErrorMsg(result.error.message?.toUpperCase() || "AUTH FAILED");
        setBootState("err");
      } else {
        setBootState("ok"); // Better Auth succeeded

        // If they signed up, show a different success message
        if (isSignup) {
          setErrorMsg("CHECK YOUR EMAIL TO VERIFY!");
        }
      }
    } catch (err) {
      setErrorMsg("NETWORK ERROR");
      setBootState("err");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn(
          "fixed inset-0 z-50 bg-[#050516]/75 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )} />

        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center outline-none perspective-[1500px]",
            !open && "pointer-events-none"
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Maviri Account Login</Dialog.Title>

          {/* Main Rig */}
          <div
            ref={rigRef}
            className={cn(
              "relative w-[340px] h-[570px] transition-transform duration-700 ease-in-out",
              open ? "translate-y-0 scale-100 opacity-100" : "translate-y-[105vh] rotate-[-10deg] opacity-0"
            )}
            style={{ transform: `scale(var(--s, 1)) translateX(var(--sh, 0px))` }}
          >
            <div className="w-full h-full perspective-[1500px]">

              {/* Tilt wrapper */}
              <div
                ref={tiltRef}
                className="relative w-full h-full transform-style-3d transition-transform duration-150 ease-out"
              >
                {/* 3D Device Body */}
                <div className="absolute inset-0 transform-style-3d">

                  {/* Ground Shadow */}
                  <div
                    className={cn(
                      "absolute -bottom-12 h-8 bg-black/60 transition-all duration-700 ease-in-out",
                      "clip-path-polygon-[8%_0,92%_0,100%_50%,92%_100%,8%_100%,0_50%]",
                      open ? "-left-[340px] right-[-14px]" : "left-[6px] right-[-14px]"
                    )}
                    style={{
                      background: "repeating-conic-gradient(rgba(0,0,0,.7) 0 25%,transparent 0 50%) 0 0 / 8px 8px"
                    }}
                  />

                  {/* THE BASE (Right side) */}
                  <section className="absolute inset-0 bg-[#d63030] pixel-shadow">
                    {/* Top LEDs */}
                    <div className="absolute top-4 right-5 flex gap-3">
                      <i className={cn("w-3.5 h-3.5 bg-[#4caf50] shadow-[inset_3px_3px_0_rgba(255,255,255,0.4),0_0_0_3px_#0e0202]", bootState === "ok" && "opacity-100")} />
                      <i className={cn("w-3.5 h-3.5 bg-[#ffeb3b] shadow-[inset_3px_3px_0_rgba(255,255,255,0.4),0_0_0_3px_#0e0202]", bootState === "busy" && "opacity-100")} />
                      <i className={cn("w-3.5 h-3.5 bg-[#c62828] shadow-[inset_3px_3px_0_rgba(255,255,255,0.4),0_0_0_3px_#0e0202]", bootState === "err" && "opacity-100")} />
                    </div>

                    {/* Big Lens */}
                    <div className="absolute top-4 right-24 w-16 h-16 bg-[#0e0202] clip-path-polygon-[25%_0,75%_0,75%_12.5%,87.5%_12.5%,87.5%_25%,100%_25%,100%_75%,87.5%_75%,87.5%_87.5%,75%_87.5%,75%_100%,25%_100%,25%_87.5%,12.5%_87.5%,12.5%_75%,0_75%,0_25%,12.5%_25%,12.5%_12.5%,25%_12.5%]">
                      <div className={cn(
                        "absolute inset-1.5 transition-colors duration-300",
                        bootState === "busy" ? "bg-[#ffd400]" : bootState === "ok" ? "bg-[#3ddc6b]" : "bg-[#2a8cff]"
                      )} style={{ clipPath: "inherit" }} />
                      <div className="absolute top-3.5 left-4 w-2.5 h-2.5 bg-[#d4f0ff]" />
                    </div>

                    {/* Styled Seam */}
                    <svg className="absolute top-[84px] w-full h-10 pointer-events-none" viewBox="0 0 340 40">
                      <path d="M100 34V30H108V26H116V22H124V18H340V34Z" fill="#b61f1f" />
                      <path d="M0 34H100V30H108V26H116V22H124V18H340" fill="none" stroke="#120303" strokeWidth="4" />
                    </svg>

                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="absolute top-5 left-5 w-8 h-8 bg-[#2b2b2b] text-white text-[10px] pixel-btn-shadow flex items-center justify-center z-20"
                      style={{ "--c": "#2b2b2b", "--l": "#666", "--d": "#000", "--e": "4px" } as React.CSSProperties}
                    >
                      X
                    </button>

                    {/* Bezel & Screen */}
                    <div className="absolute top-[132px] left-4 right-4 h-[318px] bg-[#f2f2f2] shadow-[inset_4px_4px_0_#fff,inset_-4px_-4px_0_#b4b4b4,-4px_0_#0e0202,4px_0_#0e0202,0_-4px_#0e0202,0_4px_#0e0202]">
                      <div className="absolute top-2 left-1/2 -ml-6 w-2 h-2 bg-[#ff4b3e] shadow-[32px_0_#ff4b3e]" />
                      <div className="absolute bottom-2 right-3.5 w-11 h-4 bg-[linear-gradient(#0e0202_0_4px,transparent_4px_12px,#0e0202_12px)]" />
                      <div className="absolute bottom-2 left-3.5 w-3 h-3 bg-[#ff4b3e]" />

                      {/* CRT Inner Screen */}
                      <div className="absolute top-6 left-[18px] right-[18px] bottom-[34px] bg-[#04080a] overflow-hidden text-[#9dffb0] font-[family-name:var(--font-press-start)] text-[8px] leading-[1.7] shadow-[inset_4px_4px_0_#000,inset_-4px_-4px_0_#1b2c24] crt-screen">

                        {/* Boot Screen */}
                        <div className={cn("absolute inset-0 p-4 text-[#7ee4ff] transition-opacity duration-300", bootState !== "boot" && "opacity-0 pointer-events-none")}>
                          <p className="overflow-hidden whitespace-nowrap w-0 animate-[type_0.4s_steps(16)_forwards] m-0 mb-2.5">DEX OS 1.0</p>
                          <p className="overflow-hidden whitespace-nowrap w-0 animate-[type_0.4s_steps(16)_0.5s_forwards] m-0 mb-2.5">LOADING TRAINER DB</p>
                          <p className="overflow-hidden whitespace-nowrap w-0 animate-[type_0.4s_steps(16)_1s_forwards] m-0">READY_</p>
                        </div>

                        {/* Form Screen */}
                        <form id="dex-form" onSubmit={handleSubmit} className={cn("p-3.5 h-full flex flex-col", bootState === "boot" && "invisible")}>
                          <div className="flex justify-between border-b-2 border-[#1d4a5a] pb-1.5 text-[#7ee4ff]">
                            <span>{authMode === "signup" ? "NEW TRAINER" : "WELCOME BACK"}</span>
                            <span className="animate-[blink_1s_steps(1)_infinite]">|</span>
                          </div>

                          <div className="flex gap-1.5 mt-2.5 mb-0.5">
                            <button
                              type="button"
                              onClick={() => switchMode("signup")}
                              className={cn("flex-1 py-2 text-[7px] bg-[#0b1a10] text-[#5aa86e] shadow-[inset_0_0_0_2px_#1f4a2c]", authMode === "signup" && "retro-tab-selected")}
                            >
                              SIGN UP
                            </button>
                            <button
                              type="button"
                              onClick={() => switchMode("login")}
                              className={cn("flex-1 py-2 text-[7px] bg-[#0b1a10] text-[#5aa86e] shadow-[inset_0_0_0_2px_#1f4a2c]", authMode === "login" && "retro-tab-selected")}
                            >
                              LOG IN
                            </button>
                          </div>

                          {/* Inputs */}
                          {authMode === "signup" && (
                            <label className="block mt-2.5">
                              <span className="block mb-1 text-[7px] text-[#ffd966]">► TRAINER NAME</span>
                              <input
                                value={name} onChange={e => setName(e.target.value)}
                                placeholder="RED"
                                className="block w-full border-0 outline-none p-2 bg-[#0b1a10] text-[#c4ffd0] font-[inherit] text-[8px] shadow-[inset_0_0_0_2px_#2d6a3e] focus:shadow-[inset_0_0_0_2px_#ffd966] placeholder:text-[#3d7d51]"
                              />
                            </label>
                          )}

                          <label className="block mt-2.5">
                            <span className="block mb-1 text-[7px] text-[#ffd966]">► EMAIL</span>
                            <input
                              type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@trainer.app"
                              className="block w-full border-0 outline-none p-2 bg-[#0b1a10] text-[#c4ffd0] font-[inherit] text-[8px] shadow-[inset_0_0_0_2px_#2d6a3e] focus:shadow-[inset_0_0_0_2px_#ffd966] placeholder:text-[#3d7d51]"
                            />
                          </label>

                          <label className="block mt-2.5 relative">
                            <span className="block mb-1 text-[7px] text-[#ffd966]">► PASSCODE</span>
                            <input
                              type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
                              placeholder="********"
                              className="block w-full border-0 outline-none p-2 pr-12 bg-[#0b1a10] text-[#c4ffd0] font-[inherit] text-[8px] shadow-[inset_0_0_0_2px_#2d6a3e] focus:shadow-[inset_0_0_0_2px_#ffd966] placeholder:text-[#3d7d51]"
                            />
                            <button
                              type="button" onClick={() => setShowPass(!showPass)}
                              className="absolute right-1 bottom-1 px-1 py-1.5 text-[6px] bg-[#1f4a2c] text-[#c4ffd0]"
                            >
                              {showPass ? "HIDE" : "SHOW"}
                            </button>
                          </label>

                          <div className="mt-3 mb-0 min-h-[26px] text-[7px] leading-[1.8] flex flex-col justify-end">
                            <span className={cn(bootState === "err" && "text-[#ff8a8a]")}>{errorMsg}</span>
                            {bootState === "busy" && (
                              <div className="h-2.5 mt-1.5 bg-[#0b1a10] shadow-[inset_0_0_0_2px_#2d6a3e]">
                                <div className="h-full bg-[#9dffb0] w-full animate-[fill_1.5s_steps(10)_forwards]" />
                              </div>
                            )}
                          </div>
                        </form>

                        {/* Success Screen */}
                        <div className={cn("absolute inset-0 flex flex-col items-center justify-center p-3.5 text-center bg-[#04080a] z-10 transition-opacity", bootState !== "ok" && "opacity-0 pointer-events-none")}>
                          <svg className="w-16 h-12 fill-[#9dffb0] animate-[pop_0.5s_steps(4)_both]" viewBox="0 0 8 6">
                            <path d="M6 0h2v1H6zM5 1h2v1H5zM0 2h1v1H0zM4 2h2v1H4zM0 3h2v1H0zM3 3h2v1H3zM1 4h3v1H1zM2 5h1v1H2z" />
                          </svg>
                          // components/pokedex/pokedex.tsx (inside the Success Screen div)

                          <h2 className="text-[9px] text-[#ffd966] font-normal mt-3 leading-[1.8]">
                            {authMode === "signup" ? "CHECK YOUR EMAIL" : "WELCOME BACK!"}
                          </h2>
                          <p className="text-[7px] mt-3 px-2 text-center leading-relaxed">
                            {authMode === "signup"
                              ? "A VERIFICATION LINK HAS BEEN SENT TO YOUR INBOX."
                              : "TRAINER ID #" + Math.floor(Math.random() * 9000 + 1000)}
                          </p>
                          <p className="text-[7px] mt-1">
                            {authMode === "signup" ? "CLICK IT TO ACTIVATE YOUR DEX." : "DEX SYNCED. SAFE TRAVELS!"}
                          </p>
                          <button
                            type="button"
                            onClick={onClose}
                            className="mt-4 px-2.5 py-2 text-[7px] bg-[#9dffb0] text-[#04210d]"
                          >
                            CLOSE DEX
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hardware Controls (Base) */}
                    <div className="absolute top-[462px] left-[30px] w-[60px] h-2 bg-[#8e1717]" />
                    <div className="absolute top-[462px] left-[104px] w-[60px] h-2 bg-[#2a8cff]" />

                    <button
                      className="absolute bottom-[46px] left-[68px] w-[132px] h-[48px] bg-[#3ecf5f] text-[#04210d] text-[9px] pixel-btn-shadow"
                      style={{ "--c": "#3ecf5f", "--l": "#9dffb0", "--d": "#1f8a36" } as React.CSSProperties}
                      form="dex-form" type="submit"
                    >
                      ENTER
                    </button>

                    {/* D-Pad */}
                    <div className="absolute bottom-[34px] right-[30px] w-[72px] h-[72px]">
                      <div className="absolute top-[24px] left-[24px] w-[24px] h-[24px] bg-[#1b1b1b]" />
                      <button type="button" className="absolute top-0 left-[24px] w-[24px] h-[24px] bg-[#2a2a2a] shadow-[inset_3px_3px_0_#5a5a5a,inset_-3px_-3px_0_#111,0_4px_0_#000] active:translate-y-[3px] active:shadow-none" />
                      <button type="button" className="absolute bottom-0 left-[24px] w-[24px] h-[24px] bg-[#2a2a2a] shadow-[inset_3px_3px_0_#5a5a5a,inset_-3px_-3px_0_#111,0_4px_0_#000] active:translate-y-[3px] active:shadow-none" />
                      <button type="button" className="absolute top-[24px] left-0 w-[24px] h-[24px] bg-[#2a2a2a] shadow-[inset_3px_3px_0_#5a5a5a,inset_-3px_-3px_0_#111,0_4px_0_#000] active:translate-y-[3px] active:shadow-none" onClick={() => switchMode("signup")} />
                      <button type="button" className="absolute top-[24px] right-0 w-[24px] h-[24px] bg-[#2a2a2a] shadow-[inset_3px_3px_0_#5a5a5a,inset_-3px_-3px_0_#111,0_4px_0_#000] active:translate-y-[3px] active:shadow-none" onClick={() => switchMode("login")} />
                    </div>
                  </section>

                  {/* THE LID (Left side) - Rotates on hinge */}
                  <div
                    className={cn(
                      "absolute inset-0 transform-style-3d origin-left transition-transform duration-[900ms] ease-[steps(9)]",
                      isOpen ? "translate-z-[2px] rotate-y-[-168deg]" : "translate-z-[2px] rotate-y-0"
                    )}
                  >
                    {/* Lid Front (Visible when closed) */}
                    <div className="absolute inset-0 bg-[#d63030] pixel-shadow backface-hidden flex flex-col">
                      <div className="absolute top-4 right-5 flex gap-3">
                        <i className="w-3.5 h-3.5 bg-[#4caf50] opacity-45 shadow-[inset_3px_3px_0_rgba(255,255,255,0.4),0_0_0_3px_#0e0202]" />
                        <i className="w-3.5 h-3.5 bg-[#ffeb3b] opacity-45 shadow-[inset_3px_3px_0_rgba(255,255,255,0.4),0_0_0_3px_#0e0202]" />
                        <i className="w-3.5 h-3.5 bg-[#c62828] opacity-45 shadow-[inset_3px_3px_0_rgba(255,255,255,0.4),0_0_0_3px_#0e0202]" />
                      </div>

                      <svg className="absolute top-[84px] w-full h-10 pointer-events-none" viewBox="0 0 340 40">
                        <path d="M100 34V30H108V26H116V22H124V18H340V34Z" fill="#b61f1f" />
                        <path d="M0 34H100V30H108V26H116V22H124V18H340" fill="none" stroke="#120303" strokeWidth="4" />
                      </svg>

                      <div className="absolute top-[170px] left-[30px] w-6 h-[210px] bg-[linear-gradient(90deg,rgba(255,255,255,.22)_0_12px,transparent_12px_16px,rgba(255,255,255,.12)_16px_20px,transparent_20px)]" />

                      <div className="absolute bottom-7 left-11 w-[190px] h-4 bg-[#a31a1a] shadow-[inset_0_4px_0_#7d1010]" />

                      <div className="absolute bottom-12 left-7 text-[8px] leading-[2] text-[#f6b4b4] font-[family-name:var(--font-press-start)] shadow-[2px_2px_0_#0e0202]">
                        TRAINER<br />REGISTRY
                      </div>
                    </div>

                    {/* Lid Back (Visible when open) */}
                    <div className="absolute inset-0 bg-[#8e1717] pixel-shadow backface-hidden rotate-y-180 flex flex-col">
                      <div className="absolute top-[170px] left-7 right-7 h-[230px] bg-[repeating-linear-gradient(transparent_0_12px,rgba(0,0,0,.45)_12px_20px)] shadow-[inset_0_0_0_4px_#6f1010]" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}