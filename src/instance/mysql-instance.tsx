import { Toolbar, ToolbarBackButton, ToolbarTitle } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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

export function MySQLInstance() {
  const [data, setData] = useImmer<DatabaseInstanceStoreItem>(() => ({
    id: "mysql-" + DatabaseManagerStore.generateShortId(),
    name: "MySQL Local",
    type: "mysql",
    version: "8.4.3",
    config: {
      port: "3306",
      username: "root",
      password: "123456",
    },
  }));
  const navigate = useNavigate();

  return (
    <div>
      <Toolbar>
        <ToolbarBackButton />
        <ToolbarTitle text="Create MySQL Database" icon={MySQLIcon} />
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
                <SelectGroup>
                  <SelectLabel>MySQL Community 8</SelectLabel>
                  <SelectItem value="8.4.3">8.4.30</SelectItem>
                  <SelectItem value="8.0.4">8.0.40</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>MySQL Community 5</SelectLabel>
                  <SelectItem value="5.7.40">5.7.40</SelectItem>
                </SelectGroup>
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
