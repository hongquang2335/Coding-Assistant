import { useRef, useState } from "react";

type UploadBoxProps = {
  onUpload: (file: File) => Promise<void>;
};

export function UploadBox({ onUpload }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickFile(file: File | null) {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Upload ZIP</h2>
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        disabled={isUploading}
        onChange={(event) => {
          const selected = event.target.files?.[0] ?? null;
          void handlePickFile(selected);
        }}
      />
      <p className="helper-text">
        {isUploading ? "Uploading..." : "Only .zip project archives are accepted."}
      </p>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}
