import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24 space-y-4 max-w-lg mx-auto bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 p-8 shadow-sm">
      <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#ff8a65]/20 text-[#752305]">
        404 Not Found
      </div>
      <h1 className="text-3xl font-bold text-[#1d1c15]">Page Not Found</h1>
      <p className="text-sm text-[#56423c] leading-relaxed">
        The requested learning resource or outcome does not exist in this curriculum.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#9f4122] text-white text-xs font-bold hover:bg-[#85341a] transition-all shadow-md"
        >
          <span>← Back to Overview</span>
        </Link>
      </div>
    </div>
  );
}
