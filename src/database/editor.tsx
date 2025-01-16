import FileInput from "@/components/file-input";
import InputGroup from "@/components/input-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConnectionStoreItem } from "@/lib/conn-manager-store";
import { cn, getDatabaseColor } from "@/lib/utils";
import type { OpenDialogOptions } from "electron";
import { produce } from "immer";
import { CheckIcon, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ConnectionEditorTemplateItem {
  name: keyof ConnectionStoreItem["config"];
  label: string;
  type: "text" | "password" | "file" | "textarea" | "checkbox";
  placeholder?: string;
  size?: string;
  color?: string;
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

function DotColor({ colorName }: { colorName: string }) {
  return (
    <div className={cn(`h-3 w-3 rounded-2xl`, getDatabaseColor(colorName))} />
  );
}
export default function ConnectionEditor({
  value,
  onChange,
  template,
}: ConnectionEditorProps) {
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(value.color);

  const colors = ["red", "blue", "green", "yellow", "purple", "gray"];

  return (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <Label>Name</Label>
        <div className="flex flex-row gap-3">
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
          <DropdownMenu modal={false} open={visible} onOpenChange={setVisible}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="pl-2 pr-2">
                {selectedColor && <DotColor colorName={selectedColor} />}
                <span>Choose color</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="gap-2">
              {colors.map((color, index) => {
                const active = color === selectedColor;
                return (
                  <DropdownMenuItem
                    onClick={() => {
                      onChange(
                        produce<ConnectionStoreItem>(value, (draft) => {
                          draft.color = color;
                        }),
                      );
                      setSelectedColor(color);
                    }}
                    key={index}
                  >
                    <DotColor colorName={color} />
                    <span> {color}</span>
                    <div className="flex-1" />
                    {active && <CheckIcon />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                      value={value.config[item.name] as string}
                      onChange={(filePath) => {
                        onChange(
                          produce<ConnectionStoreItem>(value, (draft) => {
                            draft.config[item.name] = filePath as never;
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
                      value={value.config[item.name] as string}
                      onChange={(e) => {
                        onChange(
                          produce<ConnectionStoreItem>(value, (draft) => {
                            draft.config[item.name] = e.target.value as never;
                          }),
                        );
                      }}
                    />
                  </InputGroup>
                );
              } else if (item.type === "checkbox") {
                return (
                  <InputGroup
                    key={item.name}
                    className={cn(
                      item.size ?? "flex-1",
                      "flex flex-row items-center gap-2",
                    )}
                  >
                    <Checkbox
                      id={"setting-" + item.name}
                      checked={value.config[item.name] as boolean}
                      onCheckedChange={(checked) => {
                        onChange(
                          produce<ConnectionStoreItem>(value, (draft) => {
                            draft.config[item.name] = checked as never;
                          }),
                        );
                      }}
                    />
                    <label
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor={"setting-" + item.name}
                    >
                      {item.label}
                    </label>
                  </InputGroup>
                );
              }

              return (
                <InputGroup key={item.name} className={item.size ?? "flex-1"}>
                  <Label>{item.label}</Label>
                  <Input
                    spellCheck={false}
                    type={item.type}
                    value={value.config[item.name] as string}
                    placeholder={item.placeholder}
                    onChange={(e) => {
                      onChange(
                        produce<ConnectionStoreItem>(value, (draft) => {
                          draft.config[item.name] = e.target.value as never;
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
