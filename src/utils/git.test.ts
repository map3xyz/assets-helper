import test from "ava";
import fs from "fs";
import { cloneOrPullRepoAndUpdateSubmodules, getCommitId } from "./git";

const REPO_CLONE_URL = "git@github.com:map3xyz/assets.git";
const DEFAULT_REPO_DISK_LOCATION = "./tmp/map3xyz-assets";

test("cloning assets repo clones and pulls submodules", async (t) => {
  try {
    await cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, DEFAULT_REPO_DISK_LOCATION, true, "master");
    const ethereumTokenlistclonedReadme = fs.existsSync(
      `${DEFAULT_REPO_DISK_LOCATION}/networks/ethereum/assets/ethereum-tokenlist/README.md`
    );
    t.true(ethereumTokenlistclonedReadme);
  } catch (err) {
    t.fail(err.message);
  }
});

test("we are able to get the commit id of a tag", async (t) => {
  try {
    await cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, DEFAULT_REPO_DISK_LOCATION, true, "master");
    const commitId = await getCommitId(DEFAULT_REPO_DISK_LOCATION, "HEAD");
    t.true(commitId.length === 40);
  } catch (err) {
    t.fail(err.message);
  }
});

