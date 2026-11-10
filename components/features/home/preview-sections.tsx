import Image from "next/image";
import { Play, CheckCircle2, Clock } from "lucide-react";

export function PreviewSections() {
  return (
    <div className="mt-24 flex flex-col gap-16">
      
      {/* Section 1: Library Preview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-2xl font-black uppercase tracking-tight text-ink mb-3">Your Personal Shelf</h2>
          <p className="text-sm font-medium text-ink-soft mb-6 leading-relaxed">
            Stop using messy spreadsheets. Maviri automatically organizes your watching, completed, and planned anime into a beautiful, visual collection. Update your progress in one click.
          </p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2 text-sm font-bold text-ink">
              <CheckCircle2 className="h-5 w-5 text-accent-secondary" /> Track episodes & rewatches
            </li>
            <li className="flex items-center gap-2 text-sm font-bold text-ink">
              <CheckCircle2 className="h-5 w-5 text-accent-secondary" /> Rate & review titles
            </li>
            <li className="flex items-center gap-2 text-sm font-bold text-ink">
              <CheckCircle2 className="h-5 w-5 text-accent-secondary" /> Quick-edit via Pokédex popup
            </li>
          </ul>
        </div>
        
        {/* Visual UI Preview */}
        <div className="order-1 md:order-2 rounded-2xl border-2 border-ink bg-paper-raised p-5 shadow-[6px_6px_0_0_var(--ink)]">
           <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-4">
             <span className="text-xs font-black uppercase tracking-widest">Currently Watching</span>
             <span className="text-xs font-bold bg-accent-primary px-2 py-0.5 rounded-md border border-ink">3 Active</span>
           </div>
           
           <div className="flex flex-col gap-4">
             {/* Mock Entry 1 */}
             <div className="flex gap-4 items-center">
               <div className="h-16 w-12 shrink-0 rounded-md border-2 border-ink bg-accent-tertiary/30" />
               <div className="flex-1">
                 <h3 className="text-sm font-bold leading-tight">Frieren: Beyond Journey's End</h3>
                 <div className="flex items-center gap-2 mt-2">
                   <div className="h-2 flex-1 rounded-full bg-ink/10 overflow-hidden border border-ink/20">
                     <div className="h-full bg-ink w-[60%]" />
                   </div>
                   <span className="text-[10px] font-black text-ink-muted">12 / 28</span>
                 </div>
               </div>
             </div>
             {/* Mock Entry 2 */}
             <div className="flex gap-4 items-center">
               <div className="h-16 w-12 shrink-0 rounded-md border-2 border-ink bg-accent-secondary/30" />
               <div className="flex-1">
                 <h3 className="text-sm font-bold leading-tight">Jujutsu Kaisen</h3>
                 <div className="flex items-center gap-2 mt-2">
                   <div className="h-2 flex-1 rounded-full bg-ink/10 overflow-hidden border border-ink/20">
                     <div className="h-full bg-ink w-[25%]" />
                   </div>
                   <span className="text-[10px] font-black text-ink-muted">6 / 24</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Section 2: Discovery & Community Split */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border-2 border-ink bg-ink p-8 text-paper shadow-[6px_6px_0_0_var(--accent-primary)] flex flex-col justify-between min-h-[300px]">
          <div>
             <h2 className="text-3xl font-black text-paper mb-4">Real discussions.<br/>No echo chambers.</h2>
             <p className="text-sm font-medium text-paper/70 max-w-md leading-relaxed">
               Join threaded conversations about the latest episodes, controversial endings, and hidden gems. Spoilers are automatically hidden based on your progress.
             </p>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button className="rounded-xl border-2 border-paper bg-paper px-5 py-2.5 text-sm font-black text-ink transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0_0_var(--accent-primary)]">
              Browse Community
            </button>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-ink bg-accent-primary p-8 shadow-[6px_6px_0_0_var(--ink)] flex flex-col justify-between min-h-[300px]">
          <div>
             <h2 className="text-2xl font-black text-ink mb-3">Visual Discovery</h2>
             <p className="text-sm font-medium text-ink/80 leading-relaxed">
               Find your next watch through genre clusters, studio spotlights, and what your friends are loving.
             </p>
          </div>
          <div className="flex -space-x-4 mt-8">
             {/* Mock stacked covers */}
             <div className="h-16 w-12 rounded-md border-2 border-ink bg-paper-raised shadow-sm rotate-[-6deg]" />
             <div className="h-16 w-12 rounded-md border-2 border-ink bg-paper-raised shadow-sm rotate-[4deg] z-10" />
             <div className="h-16 w-12 rounded-md border-2 border-ink bg-paper-raised shadow-sm rotate-[-2deg] z-20" />
          </div>
        </div>
      </section>

    </div>
  );
}