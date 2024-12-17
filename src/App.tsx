import pkg from "./../package.json";
import InstanceTab from "./instance";
import DatabaseTab from "./database";
import { Tab } from "./components/tabs";
import { useMemo, useState } from "react";
import UpdateBar from "./components/update-bar";
import { Toaster } from "./components/ui/toaster";
import ThemeProvider from "./context/theme-provider";

function Main() {
  const [selected, setSelected] = useState("connection");

  const tabs = useMemo(() => {
    return [
      { name: "Connection", key: "connection", component: <DatabaseTab /> },
      { name: "Instance", key: "instance", component: <InstanceTab /> },
    ];
  }, []);

  return (
    <>
      <div
        className="flex h-screen w-screen flex-col overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          const fileName = e.dataTransfer?.files[0].path;

          window.outerbaseIpc.connect({
            type: "sqlite",
            name: fileName,
            id: "temp_" + window.crypto.randomUUID(),
            config: {
              host: fileName,
            },
          });
          e.preventDefault();
        }}
      >
        <div className="flex-1 overflow-hidden">
          <Tab selected={selected} onChange={setSelected} tabs={tabs} />
        </div>
        <div className="flex items-center bg-gray-600 px-2 py-1 font-mono text-sm text-white dark:bg-neutral-900">
          <div>Outerbase Studio v{pkg.version}</div>
          <div className="flex-1"></div>
          <UpdateBar />
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}
