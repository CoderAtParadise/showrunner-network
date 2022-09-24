#!/usr/bin/env node
const { resolve, join } = require("path");
const {
    promises: { readdir, stat, readFile, writeFile }
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
        const fd = await readFile(file, "utf-8");
        const quotes = /"(.*?)"/g;
        const res = fd.replace(
            quotes,
            (_, g) => `"${g.replace(".js", ".cjs")}"`
        );
        await writeFile(file, res, "utf-8");
    });
};

main();
