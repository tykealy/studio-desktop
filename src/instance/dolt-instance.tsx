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

export function DoltInstance() {
  const [data, setData] = useImmer<DatabaseInstanceStoreItem>(() => ({
    id: "dolt-" + DatabaseManagerStore.generateShortId(),
    name: "Dolt Local",
    type: "dolt",
    version: "1.45.2",
    config: {
      port: "3306",
    },
  }));
  const navigate = useNavigate();

  return (
    <div>
      <Toolbar>
        <ToolbarBackButton />
        <ToolbarTitle text="Create Dolt Database" icon={MySQLIcon} />
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
                <SelectItem value="1.45.2">1.45.2</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
