import { Toolbar, ToolbarBackButton, ToolbarTitle } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ConnectionStoreItemConfig } from "@/lib/conn-manager-store";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ImportConnectionStringRoute() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [connectionString, setConnectionString] = useState("");

  const onImportClick = useCallback(() => {
    let url = new URL(connectionString);
    const protocol = url.protocol.replace(":", "");
    const supportedProtocols = ["mysql", "postgresql"];

    if (!supportedProtocols.includes(protocol)) {
      toast({
        title: "Import Failed",
        description: "Invalid connection string",
      });

      return;
    }

    // Replace the connection string protocol with http for better parsing
    url = new URL(connectionString.replace(`${protocol}:`, "http:"));

    if (protocol === "mysql") {
      console.log("Importing MySQL connection string");
      navigate("/connection/create/mysql", {
        replace: true,
        state: {
          host: url.hostname,
          port: url.port ?? 3306,
          username: url.username,
          password: url.password,
          database: url.pathname.replace("/", ""),
          ssl: !!url.searchParams.get("ssl-mode"),
        } as ConnectionStoreItemConfig,
      });
      return;
    } else if (protocol === "postgresql") {
      console.log("Importing Postgres connection string");
      navigate("/connection/create/postgres", {
        replace: true,
        state: {
          host: url.hostname,
          port: url.port ?? 5432,
          username: url.username,
          password: url.password,
          database: url.pathname.replace("/", ""),
          ssl: !!url.searchParams.get("sslmode"),
        } as ConnectionStoreItemConfig,
      });
    }
  }, [connectionString, navigate, toast]);

  return (
    <div>
      <Toolbar>
        <ToolbarBackButton />
        <ToolbarTitle text="Import from Connection String" />
      </Toolbar>

      <div className="flex flex-col gap-4 p-4">
        <Textarea
          rows={5}
          className="resize-none p-4 font-mono"
          placeholder="Connection String. Eg: mysql://root:123456@localhost:3306/database_name"
          value={connectionString}
          onChange={(e) => {
            setConnectionString(e.currentTarget.value);
          }}
        />

        <div>
          <Button onClick={onImportClick}>Import</Button>
        </div>
      </div>
    </div>
  );
}
