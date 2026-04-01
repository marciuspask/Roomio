import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "listing-photos";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export default function PhotoUpload({ value, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string[]>([]); // slot IDs currently uploading
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: File[]) => {
    const allowed = files.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_SIZE_BYTES) return false;
      return true;
    });

    const remaining = max - value.length;
    const toUpload = allowed.slice(0, remaining);
    if (toUpload.length === 0) return;

    const ids = toUpload.map(() => crypto.randomUUID());
    setUploading((prev) => [...prev, ...ids]);

    const results = await Promise.all(
      toUpload.map(async (file, i) => {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `listings/${Date.now()}-${ids[i]}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file);
        if (error) return null;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return data.publicUrl;
      }),
    );

    setUploading((prev) => prev.filter((id) => !ids.includes(id)));
    const urls = results.filter((u): u is string => u !== null);
    if (urls.length > 0) onChange([...value, ...urls]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const isFull = value.length >= max;
  const isUploading = uploading.length > 0;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!isFull && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${
            dragOver
              ? "border-primary bg-primary-light text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {isUploading ? (
            <Loader2 size={32} className="mb-2 animate-spin" />
          ) : (
            <Camera size={32} className="mb-2" />
          )}
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Drop photos here or click to upload"}
          </p>
          <p className="text-xs">JPEG, PNG, WebP · max 5 MB each</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Previews */}
      {(value.length > 0 || isUploading) && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative">
              <img src={url} alt="" className="aspect-video w-full rounded-lg object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-foreground/60 px-1.5 py-0.5 text-[10px] text-primary-foreground">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/60 text-xs text-primary-foreground hover:bg-foreground/80"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {/* Uploading spinners */}
          {uploading.map((id) => (
            <div key={id} className="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-elevated">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length} / {max} photos
      </p>
    </div>
  );
}
