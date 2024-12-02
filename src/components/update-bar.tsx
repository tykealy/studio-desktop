import { type ProgressInfo } from "electron-updater";
import { LucideLoader } from "lucide-react";
import { useEffect, useState } from "react";

export default function UpdateBar() {
  const [checkingUpdate, setCheckingUpdate] = useState(true);
  const [isLatest, setLatest] = useState(false);
  const [isComplete, setComplete] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo>();

  // Update is not avaliable
  useEffect(() => {
    const handler = () => {
      setCheckingUpdate(false);
      setLatest(true);
    };

    window.outerbaseIpc.on("update-not-available", handler);
    return () => {
      window.outerbaseIpc.off("update-not-available", handler);
    };
  }, []);

  // Progress bar
  useEffect(() => {
    const handler = (_: unknown, info: ProgressInfo) => {
      setCheckingUpdate(false);
      setProgress(info);
    };

    window.outerbaseIpc.on("update-download-progress", handler);

    return () => {
      window.outerbaseIpc.off("update-download-progress", handler);
    };
  }, []);

  // Completed event
  useEffect(() => {
    const handler = () => {
      setComplete(true);
      setCheckingUpdate(false);
    };

    window.outerbaseIpc.on("update-downloaded", handler);

    return () => {
      window.outerbaseIpc.off("update-downloaded", handler);
    };
  }, []);

  if (checkingUpdate) {
    return (
      <div className="flex items-center justify-end pr-2">
        <LucideLoader
          className="mr-2 inline-block h-4 w-4 animate-spin"
          size={16}
        />
        Checking for update
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex items-center justify-end pr-2">
        Update downloaded. Restart to apply changes.
      </div>
    );
  }

  if (isLatest) {
    return (
      <div className="flex items-center justify-end pr-2">Latest version</div>
    );
  }

  if (progress) {
    return (
      <div className="flex items-center justify-end pr-2">
        <LucideLoader
          className="mr-2 inline-block h-4 w-4 animate-spin"
          size={16}
        />
        Downloading update {progress.percent.toFixed(2)}%
      </div>
    );
  }

  return <div className="flex items-center justify-end pr-2"></div>;
}
