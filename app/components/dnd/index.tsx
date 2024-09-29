import { Upload } from "lucide-react";
import { ChangeEvent, ReactNode } from "react";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone-esm";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";

type Props = {
  rootProps: DropzoneRootProps;
  inputProps: DropzoneInputProps;
  isDragActive: boolean;
  file: File | null;
  onFileChange: (file: File) => void;
  placeholder?: ReactNode;
  className?: string;
};

export function DnD({
  rootProps,
  inputProps,
  isDragActive,
  placeholder = (
    <>
      <Upload size={20} />
      <span>ドラッグ & ドロップも可能</span>
    </>
  ),
  file,
  onFileChange,
  className,
}: Props) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    onFileChange(e.target.files[0]);
  };
  return (
    <div
      {...rootProps}
      className={cn(
        "h-[300px] overflow-hidden border border-dashed border-[#444444] mt-5",
        isDragActive && "border-orange-600 bg-orange-100",
        className
      )}
    >
      <div className="h-full flex items-center justify-center">
        {!file && <p className="text-gray-500 flex gap-2">{placeholder}</p>}
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="object-contain max-h-full"
          />
        )}
        <Input onChange={onChange} {...inputProps} />
      </div>
    </div>
  );
}
