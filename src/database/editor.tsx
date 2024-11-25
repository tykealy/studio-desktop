import FileInput from "@/components/file-input";
import InputGroup from "@/components/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConnectionStoreItem } from "@/lib/conn-manager-store";
import type { OpenDialogOptions } from "electron";
import { produce } from "immer";

interface ConnectionEditorTemplateItem {
  name: keyof ConnectionStoreItem["config"];
  label: string;
  type: "text" | "password" | "file" | "textarea";
  placeholder?: string;
  size?: string;
  required?: boolean;
  fileOption?: OpenDialogOptions;
}

export type ConnectionEditorTemplateRow = {
  columns: ConnectionEditorTemplateItem[];
};

export type ConnectionEditorTemplate = ConnectionEditorTemplateRow[];

interface ConnectionEditorProps {
  template: ConnectionEditorTemplate;
  value: ConnectionStoreItem;
  onChange: (value: ConnectionStoreItem) => void;
}

export default function ConnectionEditor({
  value,
  onChange,
  template,
}: ConnectionEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <Label>Name</Label>
        <Input
          autoFocus
          spellCheck={false}
          value={value.name}
          onChange={(e) => {
            onChange(
              produce<ConnectionStoreItem>(value, (draft) => {
                draft.name = e.target.value;
              }),
            );
          }}
        />
      </InputGroup>

      {template.map((row, rowIdx) => {
        return (
          <div key={rowIdx} className="flex gap-4">
            {row.columns.map((item) => {
              if (item.type === "file") {
                return (
                  <InputGroup key={item.name} className={item.size ?? "flex-1"}>
                    <Label>{item.label}</Label>
                    <FileInput
                      options={item.fileOption}
                      value={value.config[item.name]}
                      onChange={(filePath) => {
                        onChange(
                          produce<ConnectionStoreItem>(value, (draft) => {
                            draft.config[item.name] = filePath;
                          }),
                        );
                      }}
                    />
                  </InputGroup>
                );
              } else if (item.type === "textarea") {
                return (
                  <InputGroup key={item.name} className={item.size ?? "flex-1"}>
                    <Label>{item.label}</Label>
                    <Textarea
                      className="resize-none"
                      placeholder={item.placeholder}
                      value={value.config[item.name]}
                      onChange={(e) => {
                        onChange(
                          produce<ConnectionStoreItem>(value, (draft) => {
                            draft.config[item.name] = e.target.value;
                          }),
                        );
                      }}
                    />
                  </InputGroup>
                );
              }

              return (
                <InputGroup key={item.name} className={item.size ?? "flex-1"}>
                  <Label>{item.label}</Label>
                  <Input
                    spellCheck={false}
                    type={item.type}
                    value={value.config[item.name]}
                    placeholder={item.placeholder}
                    onChange={(e) => {
                      onChange(
                        produce<ConnectionStoreItem>(value, (draft) => {
                          draft.config[item.name] = e.target.value;
                        }),
                      );
                    }}
                  />
                </InputGroup>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
