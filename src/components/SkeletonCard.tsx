export function SkeletonRow() {
  return (
    <div className="glass rounded-[24px] p-3.5 flex items-center gap-3">
      <div className="shimmer h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-3 w-24 rounded-full" />
        <div className="shimmer h-2 w-16 rounded-full" />
      </div>
      <div className="space-y-2 text-right">
        <div className="shimmer h-3 w-20 rounded-full ml-auto" />
        <div className="shimmer h-2 w-14 rounded-full ml-auto" />
      </div>
    </div>
  );
}
