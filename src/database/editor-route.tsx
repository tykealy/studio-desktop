import { Toolbar, ToolbarBackButton, ToolbarTitle } from "@/components/toolbar";
import ConnectionEditor from "./editor";
import { useNavigate, useParams } from "react-router-dom";
import {
  ConnectionStoreItem,
  ConnectionStoreManager,
  connectionTypeTemplates,
} from "@/lib/conn-manager-store";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
export function ConnectionCreateUpdateRoute() {
  const { type, connectionId } = useParams<{
    type: string;
    connectionId?: string;
  }>();

  const navigate = useNavigate();
  const template = connectionTypeTemplates[type as string];
  const [value, setValue] = useState<ConnectionStoreItem>(() => {
    if (connectionId) {
      const connectionValue = ConnectionStoreManager.get(connectionId);
      if (connectionValue) return connectionValue;
    }

    return {
      id: crypto.randomUUID(),
      name: "Unnamed Connection",
      type: type!,
      config: structuredClone(template.defaultValue),
    };
  });

  const onSaveClicked = useCallback(() => {
    ConnectionStoreManager.save(value);
    navigate(-1);
  }, [value, navigate]);

  return (
    <div>
      <Toolbar>
        <ToolbarBackButton />
        <ToolbarTitle text={template.label} />
      </Toolbar>
      <div className="p-8">
        <ConnectionEditor
          template={template.template}
          onChange={setValue}
          value={value}
        />
      </div>
      <div className="flex gap-2 border-t px-8 py-4">
        <Button onClick={onSaveClicked}>Save</Button>
      </div>
    </div>
  );
}
