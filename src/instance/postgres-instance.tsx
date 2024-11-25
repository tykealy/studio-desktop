import { Toolbar, ToolbarBackButton, ToolbarTitle } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DatabaseInstanceStoreItem,
  DatabaseManagerStore,
} from "@/lib/db-manager-store";
import { MySQLIcon } from "@/lib/outerbase-icon";
import { useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";

export function PostgresInstance() {
  const [data, setData] = useImmer<DatabaseInstanceStoreItem>(() => ({
    id: "postgres-" + DatabaseManagerStore.generateShortId(),
    name: "Postgres Local",
    type: "postgres",
    version: "17.1",
    config: {
      port: "5432",
      username: "postgres",
      password: "123456",
    },
  }));
  const navigate = useNavigate();

  return (
    <div>
      <Toolbar>
        <ToolbarBackButton />
        <ToolbarTitle text="Create PostgresSQL Database" icon={MySQLIcon} />
      </Toolbar>

      <div className="flex flex-col gap-4 p-8">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label>Name</Label>
            <Input
              value={data.name}
              onChange={(e) =>
                setData((d) => {
                  d.name = e.target.value;
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Version</Label>
            <Select
              value={data.version}
              onValueChange={(v) => {
                setData((d) => {
                  d.version = v;
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="17.1">PostgreSQL 17.1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label>Username</Label>
            <Input
              value={data.config.username}
              onChange={(e) =>
                setData((d) => {
                  d.config.username = e.target.value;
                })
              }
            />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <Label>Password</Label>
            <Input
              value={data.config.password}
              onChange={(e) =>
                setData((d) => {
                  d.config.password = e.target.value;
                })
              }
            />
          </div>

          <div className="flex w-[150px] flex-col gap-2">
            <Label>Port</Label>
            <Input
              value={data.config.port}
              onChange={(e) =>
                setData((d) => {
                  d.config.port = e.target.value;
                })
              }
            />
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => {
              DatabaseManagerStore.add(data);
              navigate(-1);
            }}
          >
            Launch
          </Button>
        </div>
      </div>
    </div>
  );
}
