"use client";

export default function CopyLinkButton({ link }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Booking link copied to clipboard.");
    } catch {
      alert("Could not copy. Copy the link manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
    >
      Copy
    </button>
  );
}
