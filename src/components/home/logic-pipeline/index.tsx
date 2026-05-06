export default function LogicPipeline() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-20">
      <div className="w-full max-w-xs p-4 rounded-xl border bg-muted/30 italic text-sm text-muted-foreground">
        &quot;The WiFi in block B isn&apos;t connecting...&quot;
      </div>
      <div className="h-px w-12 bg-border hidden md:block" />
      <div className="px-4 py-2 rounded-full border bg-primary text-primary-foreground text-xs font-bold animate-pulse">
        PROCESSING
      </div>
      <div className="h-px w-12 bg-border hidden md:block" />
      <div className="w-full max-w-xs p-4 rounded-xl border bg-card flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 italic">IT</div>
        <div>
          <p className="text-xs font-bold">Category: Network</p>
          <p className="text-[10px] text-muted-foreground">Priority: Medium</p>
        </div>
      </div>
    </div>
  );
}