import { useState } from "react";
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

export default function ConnectionItem({
  item,
  selectedConnection,
  setSelectedConnection,
  setConnectionList,
  setDeletingConnectionId,
}: {
  item: ConnectionStoreItem;
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
  return (
    <div
      onMouseDown={() => {
        setSelectedConnection(item.id);
      }}
      onDoubleClick={() => onConnect()}
      className={cn(
        "relative h-32 cursor-pointer gap-4 rounded-lg border p-3 pr-2 hover:bg-gray-100 dark:hover:bg-neutral-800",
        selectedConnection === item.id
          ? "bg-gray-100 dark:bg-neutral-900"
          : "bg-background",
      )}
    >
      <div className="flex flex-1 gap-3">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-sm",
            item.color
              ? getDatabaseColor(item.color)
              : "bg-gray-200 dark:bg-neutral-800",
          )}
        >
          <IconComponent
            className={cn("h-8 w-8", item.color ? "text-white" : undefined)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 text-sm">
          <div className="line-clamp-2 font-semibold">{item.name}</div>
          <div className="font-mono capitalize text-neutral-600">
            {item.type}
          </div>
        </div>
        <div>
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
      {(!!item.updatedAt || !!item.lastConnectedAt) && (
        <div className="absolute bottom-3 text-sm text-neutral-600">
          {item?.updatedAt === item?.lastConnectedAt
            ? "Updated"
            : "Last connected"}{" "}
          {item?.lastConnectedAt
            ? timeAgo(item?.lastConnectedAt, true)
            : "unknown"}
        </div>
      )}
    </div>
  );
}
