import { DatabaseInstanceStoreItem } from "@/lib/db-manager-store";
import Docker, { ContainerInfo, ContainerInspectInfo } from "dockerode";

export interface PullImageProgress {
  status: string;
  progressDetail: { current: number; total: number };
  progress: string;
  id: string;
}
export class DockerHelper {
  static docker: Docker;

  static getDocker(): Docker {
    if (DockerHelper.docker) return this.docker;
    DockerHelper.docker = new Docker();
    return DockerHelper.docker;
  }

  static async getContainer(
    id: string,
  ): Promise<ContainerInspectInfo | undefined> {
    console.log("get", id);
    const docker = DockerHelper.getDocker();

    return await new Promise((resolve) => {
      docker.getContainer(id).inspect((err, data) => {
        if (err) resolve(undefined);
        resolve(data);
      });
    });
  }

  static async createContainer(data: DatabaseInstanceStoreItem) {
    console.log("creating", data);
    const docker = DockerHelper.getDocker();

    if (data.type === "mysql") {
      await docker.createContainer({
        name: data.id,
        Image: `mysql:${data.version}`,
        Env: [
          data.config.username !== "root"
            ? `MYSQL_USER=${data.config.username}`
            : "",
          `MYSQL_PASSWORD=${data.config.username}`,
          `MYSQL_ROOT_PASSWORD=${data.config.password}`,
        ].filter(Boolean),
        ExposedPorts: { "3306/tcp": {} },
        HostConfig: {
          PortBindings: { "3306/tcp": [{ HostPort: `${data.config.port}` }] },
        },
      });
    } else {
      await docker.createContainer({
        name: data.id,
        Image: `postgres:${data.version}`,
        Env: [
          `POSTGRES_PASSWORD=${data.config.password}`,
          `POSTGRES_USER=${data.config.username}`,
        ],
        ExposedPorts: { "5432/tcp": {} },
        HostConfig: {
          PortBindings: { "5432/tcp": [{ HostPort: `${data.config.port}` }] },
        },
      });
    }
  }

  static async removeContainer(id: string) {
    const docker = DockerHelper.getDocker();
    return await new Promise((resolve, reject) => {
      docker.getContainer(id).remove((err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }

  static async pullImage(
    data: DatabaseInstanceStoreItem,
    progressCallback: (event: PullImageProgress) => void,
  ) {
    console.log("pulling", data);
    const docker = DockerHelper.getDocker();
    return await new Promise((resolve, reject) => {
      docker.pull(`${data.type}:${data.version}`, {}, (err, stream) => {
        if (err) reject(err);

        if (!stream) {
          reject(new Error("Stream is not available"));
          return;
        }

        docker.modem.followProgress(
          stream,
          (err) => {
            if (err) reject(err);
            resolve(true);
          },
          progressCallback,
        );
      });
    });
  }

  static async stopContainer(id: string) {
    console.log("stopping", id);
    const docker = DockerHelper.getDocker();
    return await new Promise((resolve, reject) => {
      docker.getContainer(id).stop((err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }

  static async startContainer(id: string) {
    console.log("starting", id);
    const docker = DockerHelper.getDocker();
    return await new Promise((resolve, reject) => {
      docker.getContainer(id).start((err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }

  static async list(): Promise<ContainerInfo[]> {
    const docker = DockerHelper.getDocker();

    return await new Promise((resolve, reject) => {
      docker.listContainers(
        {
          all: true,
        },
        (err, containers) => {
          if (err) reject(err);
          resolve(containers ?? []);
        },
      );
    });
  }
}
