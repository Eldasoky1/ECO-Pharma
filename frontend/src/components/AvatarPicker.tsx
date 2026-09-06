import React, { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { fileToDataUrl } from "../utils/image";
import { UserAvatar } from "./UserAvatar";

interface AvatarPickerProps {
  name: string;
  value: string;
  onChange: (dataUrl: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ name, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Could not read that image. Try another file.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <UserAvatar name={name} avatarUrl={value} size="lg" />
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-[#0b2418]/80 border border-emerald-200 dark:border-[#123021] text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl hover:bg-emerald-100 dark:hover:bg-[#123021] transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-[#0b2418] hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};