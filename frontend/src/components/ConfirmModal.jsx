import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#1B1E25] border border-white/[0.08] rounded-xl p-5 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center">
            <AlertTriangle size={16} className="text-[#F5A524]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#E8E8E6]">{title}</h2>
            <p className="text-sm text-[#8B92A0] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="text-sm text-[#8B92A0] hover:text-[#E8E8E6] px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-medium bg-[#F5A524] text-[#241802] rounded-md px-3 py-1.5 hover:bg-[#e0961e] transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
