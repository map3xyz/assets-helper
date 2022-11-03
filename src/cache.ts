import { cloneOrPullRepoAndUpdateSubmodules } from "./utils";
import { REPO_CLONE_URL, DEFAULT_REPO_DISK_LOCATION, DEFAULT_TWA_DISK_LOCATION, TWA_REPO_CLONE_URL } from "./utils/constants";

async function main() {
    console.log("Caching assets repo ahead of tests");
    await Promise.all([
        cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, DEFAULT_REPO_DISK_LOCATION, true, "master"),
        cloneOrPullRepoAndUpdateSubmodules(TWA_REPO_CLONE_URL, DEFAULT_TWA_DISK_LOCATION, true, "master"),
    ]);
    console.log("Caching completed");
}

main().catch(err => console.error(err));


