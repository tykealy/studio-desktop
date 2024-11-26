import dotenv from 'dotenv';
import { notarize } from '@electron/notarize';

dotenv.config();

export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  console.log("electronPlatformName = ", electronPlatformName);
  console.log("appOutDir = ", appOutDir);
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
};