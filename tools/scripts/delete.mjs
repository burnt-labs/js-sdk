import { exit } from "process";
import { getArgs, readJsonFile, redLog, runCommand, writeJsonFile, question } from "./utils.mjs";

const args = getArgs();

const flag = args[0];
const project = args[1];

if (flag !== '--package' && flag !== '--app') {
    redLog("Must provide a flag '--package' or '--app' ");
    exit();
}

const flags = {
    "--package": './packages/' + project,
    "--app": './apps/' + project,
}

const projectPath = flags[flag];

if (!project) {
    redLog(`Must provide the name of the project inside your '${projectPath.replace(project, '')}{YOUR PROJECT}' folder`);
    exit();
}

const FILES_TO_MODIFIED = {
    CONFIG: 'tsconfig.base.json',
    WORKSPACE: 'workspace.json',
    PROJECT: projectPath,
}

console.log("- Files to be modified/deleted:");
console.log(FILES_TO_MODIFIED);

await question(`Overwrite '${FILES_TO_MODIFIED.CONFIG}' path(s)?`,
    {
        no: () => {
            console.log("Not overwritting " + FILES_TO_MODIFIED.CONFIG);
        },
        yes: async () => {
            const json = await readJsonFile(FILES_TO_MODIFIED.CONFIG);

            const paths = Object.keys(json.compilerOptions.paths);

            // -- get paths contains project name
            const toRemove = [];

            paths.forEach((path, i) => {
                if (path.includes(project)) {
                    toRemove.push(path);
                }
            })

            // -- delete item
            toRemove.forEach((path) => {
                delete json.compilerOptions.paths[path]
            });

            await writeJsonFile(FILES_TO_MODIFIED.CONFIG, json);
        },
    })

await question(`Overwrite '${FILES_TO_MODIFIED.WORKSPACE}' path(s)?`,
    {
        no: () => {
            console.log("Not overwritting " + FILES_TO_MODIFIED.WORKSPACE);
        },
        yes: async () => {
            const json = await readJsonFile(FILES_TO_MODIFIED.WORKSPACE);

            const paths = Object.keys(json.projects);

            // -- get paths contains project name
            const toRemove = [];

            paths.forEach((path, i) => {
                if (path.includes(project)) {
                    toRemove.push(path);
                }
            })

            // -- delete item
            toRemove.forEach((path) => {
                delete json.projects[path]
            });

            await writeJsonFile(FILES_TO_MODIFIED.WORKSPACE, json);
        },
    })

await question(`Delete '${FILES_TO_MODIFIED.PROJECT}'?`,
    {
        no: () => {
            console.log("Not overwritting " + FILES_TO_MODIFIED.PROJECT);
        },
        yes: async () => {
            await runCommand(`rm -rf ${FILES_TO_MODIFIED.PROJECT}`);
        },
    })

exit();