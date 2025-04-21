import React, { useState } from "react";

interface SelectedFiles {
  file: File;
  preview?: string | ArrayBuffer | null;
}

export function useFile() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1000 * 1000) {
      setError("File with maximum size of 5MB is allowed");
      return false;
    }
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
        setError("Error reading file");
      };
      reader.onloadend = () => {
        setSelectedFile(reader.result as string);
      };
    }
  };
  return { selectedFile, setSelectedFile, error, handleFile, setError };
}

export function useFiles() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = [...Array.from(files ?? [])];
      const errors: string[] = [];
      if (fileArray.length > 10) {
        errors.push("You can only upload up to 10 media files");
        return;
      }
      const validFiles = fileArray.filter((file) => {
        if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/")
        ) {
          errors.push("Please upload only image or video files");
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          errors.push("File size should be less than 10MB");
          return false;
        }
        return true;
      });
      if (errors.length > 0) {
        setErr(errors.join(", "));
        return;
      }
      setSelectedFiles([]);
      setErr(null);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFiles((prev) => [
            ...prev,
            { file, preview: reader.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  return { selectedFiles, setSelectedFiles, err, setErr, handleImage };
}
