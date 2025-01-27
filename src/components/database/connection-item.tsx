import { useMemo, useState } from "react";
import {
  ConnectionStoreItem,
  ConnectionStoreManager,
  connectionTypeTemplates,
} from "@/lib/conn-manager-store";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MySQLIcon } from "@/lib/outerbase-icon";
import { Button } from "../ui/button";
import {
  LucideCopy,
  LucideMoreHorizontal,
  LucidePencil,
  LucideTrash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { generateConnectionString } from "@/lib/connection-string";
import { cn, getDatabaseColor } from "@/lib/utils";
import { DispatchState } from "./type";
import useTimeAgo from "@/hooks/useTimeAgo";
import { HighlightText } from "../ui/highlight";

const BeautifyDatabaseName: Record<string, string> = {
  mysql: "MySQL",
  postgres: "Postgres",
  sqlite: "SQLite",
  mssql: "MSSQL",
  mongodb: "MongoDB",
  dolt: "Dolt",
};

export default function ConnectionItem({
  item,
  highlight,
  selectedConnection,
  setSelectedConnection,
  setConnectionList,
  setDeletingConnectionId,
}: {
  item: ConnectionStoreItem;
  highlight?: string;
  selectedConnection?: string;
  setSelectedConnection: DispatchState<string>;
  setConnectionList: DispatchState<ConnectionStoreItem[]>;
  setDeletingConnectionId: DispatchState<ConnectionStoreItem | null>;
}) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const { timeAgo } = useTimeAgo();

  const { toast } = useToast();
  const navigate = useNavigate();
  const typeConfig = connectionTypeTemplates[item.type];
  const IconComponent = typeConfig?.icon ?? MySQLIcon;

  function onConnect(debuggerMode = false) {
    window.outerbaseIpc
      .connect(item, debuggerMode)
      .then(() => {
        ConnectionStoreManager.save({ ...item, lastConnectedAt: Date.now() });
      })
      .finally(() => {
        setConnectionList(ConnectionStoreManager.list());
      });
  }

  const lastConnectedAt = useMemo(() => {
    if (item.lastConnectedAt) {
      return timeAgo(item.lastConnectedAt);
    }
  }, [timeAgo, item]);

  return (
    <div
      title={item.name}
      onMouseDown={() => {
        setSelectedConnection(item.id);
      }}
      onDoubleClick={() => onConnect()}
      className={cn(
        "group relative cursor-pointer gap-4 rounded-lg border bg-background p-3 pr-2 transition-colors hover:border-gray-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 xl:w-[300px]",
        selectedConnection === item.id
          ? "outline outline-1 outline-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:outline-0 dark:outline-zinc-800"
          : "bg-background",
      )}
    >
      <div className="flex flex-1 gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            item.color
              ? getDatabaseColor(item.color)
              : "bg-gray-100 dark:bg-neutral-800",
          )}
        >
          <IconComponent
            className={cn("h-8 w-8", item.color ? "text-white" : undefined)}
          />
        </div>
        <div className="flex flex-1 flex-col justify-center leading-6">
          <div className="text-md line-clamp-1 font-bold">
            <HighlightText text={item.name} highlight={highlight} />
          </div>
          <div className="text-xs text-muted-foreground">
            {BeautifyDatabaseName[item.type] ?? item.type}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100">
          <DropdownMenu
            modal={false}
            open={isMenuOpen}
            onOpenChange={setMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <LucideMoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem inset onClick={() => onConnect()}>
                Connect
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/connection/edit/${item.type}/${item.id}`);
                }}
              >
                <LucidePencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setConnectionList(ConnectionStoreManager.duplicate(item));
                }}
                inset
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  window.navigator.clipboard.writeText(
                    generateConnectionString(item, false),
                  );
                  toast({
                    title: "Connection string copied to clipboard",
                    duration: 1000,
                  });
                }}
              >
                <LucideCopy className="h-4 w-4" />
                Copy Connection String
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setDeletingConnectionId(item);
                }}
              >
                <LucideTrash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-4"> </div>

      <div className="h-4 text-xs text-neutral-600">
        {lastConnectedAt ? `Last connected ${lastConnectedAt}` : " "}
      </div>
    </div>
  );
}
