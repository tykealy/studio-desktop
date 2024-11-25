import { type OpenDialogOptions } from "electron";
import { LucideFile, LucideFolderOpen } from "lucide-react";

interface FileInputProps {
  value?: string;
  onChange: (value: string) => void;
  options?: OpenDialogOptions;
}

export default function FileInput({
  options,
  onChange,
  value,
}: FileInputProps) {
  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-md border p-2 text-sm shadow-sm"
      onClick={() => {
        window.outerbaseIpc.openFileDialog(options).then((files) => {
          if (files.filePaths.length > 0) {
            onChange(files.filePaths[0]);
          }
        });
      }}
    >
      <div>
        <LucideFile className="h-4 w-4" />
      </div>
      <div className="flex-1 overflow-hidden" title={value}>
        <div
          className="line-clamp-1 block overflow-hidden text-ellipsis whitespace-nowrap text-left"
          style={{ direction: "rtl" }}
        >
          {value ? value : "Browse File"}
        </div>
      </div>
      <div>
        <LucideFolderOpen className="h-4 w-4" />
      </div>
    </div>
  );
}
