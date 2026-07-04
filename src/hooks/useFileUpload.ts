import { useRef, useState } from 'react';

export default function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) return;

    setFiles((prev) => [...prev, ...selectedFiles]);

    // 같은 파일을 다시 선택할 수 있도록 input 값을 초기화
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);

    window.open(fileUrl, '_blank');
  };

  return {
    files,
    fileInputRef,
    openFilePicker,
    addFiles,
    removeFile,
    openFile,
  };
}
