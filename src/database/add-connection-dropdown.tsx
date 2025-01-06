import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { connectionTypeTemplates } from "@/lib/conn-manager-store";
import { LucidePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ConnectionDropdownItem({
  name,
  beta,
}: {
  name: string;
  beta?: boolean;
}) {
  const navigate = useNavigate();
  const template = connectionTypeTemplates[name];

  return (
    <button
      className={
        "flex items-center justify-start rounded-lg p-2 text-left font-mono text-sm hover:bg-secondary"
      }
      onClick={() => {
        navigate(`/connection/create/${name}`);
      }}
    >
      {template.icon && <template.icon className="mr-2 h-5 w-5" />}
      {template.label}
      {beta && (
        <span className="ml-2 rounded bg-green-700 px-1 text-xs text-white">
          Beta
        </span>
      )}
    </button>
  );
}

export default function AddConnectionDropdown() {
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"}>
          <LucidePlus className="h-4 w-4" /> Add Connection
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="m-0 flex w-[370px] flex-col p-0">
        <div className="flex flex-1">
          <div className="flex-1 border-r p-2 pt-2">
            <small className="letter-2 p-2 font-semibold">SQLITE-BASED</small>

            <div className="my-2 flex flex-col gap-2">
              <ConnectionDropdownItem name="sqlite" />
              <ConnectionDropdownItem name="turso" />
              <ConnectionDropdownItem name="cloudflare" />
              <ConnectionDropdownItem name="starbase" />
            </div>
          </div>
          <div className="flex-1 pt-2">
            <div className="p-2 pt-0">
              <small className="letter-2 p-2 font-semibold">MYSQL-BASED</small>

              <div className="my-2 flex flex-col gap-2">
                <ConnectionDropdownItem name="mysql" beta />
                <ConnectionDropdownItem name="dolt" beta />
              </div>
            </div>
            <div className="pt-t border-t p-2">
              <small className="letter-2 p-2 font-semibold">
                POSTGRES-BASED
              </small>
              <div className="my-2 flex flex-col gap-2">
                <ConnectionDropdownItem name="postgres" beta />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 border-t p-2">
          <button
            className="flex flex-1 items-center justify-start rounded-lg p-2 text-left text-sm font-semibold hover:bg-secondary"
            onClick={() => {
              navigate("/connection/import");
            }}
          >
            <LucidePlus className="mr-2 h-4 w-4" />
            Import Connection String
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
