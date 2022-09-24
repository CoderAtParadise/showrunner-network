#!/usr/bin/env node
const { join, basename, resolve, dirname,extname } = require("path");
const {
    promises: { readdir, stat, rename }
} = require("fs");

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(
        subdirs.map(async (subdir) => {
            const res = resolve(dir, subdir);
            return (await stat(res)).isDirectory() ? getFiles(res) : res;
        })
    );
    return files.reduce((a, f) => a.concat(f), []);
}

const main = async () => {
    const files = await getFiles(join(process.cwd(), process.argv[2]));
    files.forEach(async (file) => {
        if (extname(file) === ".js")
            await rename(
                file,
                join(dirname(file), basename(file, ".js") + ".cjs")
            );
    });
};

main();
