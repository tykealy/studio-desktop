import { useMemo, useState } from "react";
import { Tab } from "./components/tabs";
import InstanceTab from "./instance";
import DatabaseTab from "./database";
import { Toaster } from "./components/ui/toaster";

function App() {
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
        className="h-screen w-screen"
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
        <Tab selected={selected} onChange={setSelected} tabs={tabs} />
      </div>
      <Toaster />
    </>
  );
}

export default App;
