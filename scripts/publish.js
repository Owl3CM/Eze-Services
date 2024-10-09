import { exec } from "child_process";
import { promisify } from "util";
import pak from "../package.json" assert { type: "json" };

// Promisify exec to use async/await
const execAsync = promisify(exec);

async function run() {
  const versions = pak.version.split(".");
  const version = `${versions[0]}.${versions[1]}.${+versions[2] + 1}`;
  const buildDist = "yarn build";
  const addComment = "git add .";
  const publish = `yarn publish --new-version ${version} --access public`;
  const gitPush = "git push";

  try {
    await execAsync("clear");
    console.log("Publishing...");
    await execAsync(addComment);
    console.log("commented");
    await execAsync(buildDist);
    console.log("building dist");
    await execAsync(publish);
    console.log("publishing");
    await execAsync(gitPush);
    console.log("published!");
  } catch (error) {
    console.error(`Error executing commands: ${error}`);
  }
}

run();
