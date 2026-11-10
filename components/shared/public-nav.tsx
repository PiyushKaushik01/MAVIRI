"use client";

import { useEffect, useState } from "react";
import { Pokedex } from "@/components/pokedex/pokedex";
import { NavPokedex } from "./nav-pokedex";

export function PublicNav() {
  const [pokedexOpen, setPokedexOpen] = useState(false);

  useEffect(() => {
    const openAuth = () => setPokedexOpen(true);
    window.addEventListener("maviri:open-auth", openAuth);
    return () => window.removeEventListener("maviri:open-auth", openAuth);
  }, []);

  return (
    <>
      <NavPokedex onOpenAuth={() => setPokedexOpen(true)} />
      <Pokedex open={pokedexOpen} onClose={() => setPokedexOpen(false)} mode="auth" />
    </>
  );
}
