"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImageUp, LoaderCircle } from "lucide-react";
import { useImageUpload, type UploadedImage } from "./useImageUpload";
import type { StorageBucket } from "@/lib/storage/actions";

export type { UploadedImage };

export interface ImageUploaderProps {
  bucket: StorageBucket;
  value?: { url: string; width: number; height: number } | null;
  onChange: (image: UploadedImage) => void;
  label?: string;
  previewClassName?: string;
  /** Center the preview + button (used inside modals). */
  centered?: boolean;
}

export function ImageUploader({ bucket, value, onChange, label, previewClassName, centered }: ImageUploaderProps) {
  const { uploading, error, upload } = useImageUpload(bucket);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const image = await upload(file);
    if (image) onChange(image);
  }

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${centered ? "items-center text-center" : ""}`}>
      {label ? <span className={`text-xs font-bold text-[var(--gn-palette-3)] ${centered ? "self-start" : ""}`}>{label}</span> : null}
      {value ? (
        <Image src={value.url} alt="" width={value.width} height={value.height} className={previewClassName ?? "h-28 w-full rounded-xl object-cover"} />
      ) : (
        // Same sizing classes as the loaded-image preview (aspect ratio, width,
        // radius) plus the box treatment those alone don't provide — passing
        // previewClassName straight through here used to drop the "Sin imagen"
        // placeholder onto one unstyled line with no border or centering.
        <div className={`flex items-center justify-center border border-dashed border-[#cfd6d0] bg-[#f8f9f7] text-xs text-[var(--gn-palette-5)] ${previewClassName ?? "h-28 w-full rounded-xl"}`}>
          Sin imagen
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); event.target.value = ""; }} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#d9ded9] bg-white px-3 py-2 text-xs font-semibold text-[var(--gn-palette-3)] disabled:opacity-50">
        {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}{uploading ? "Subiendo…" : value ? "Cambiar imagen" : "Seleccionar imagen"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
