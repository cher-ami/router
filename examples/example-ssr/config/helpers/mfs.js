import * as fs from "fs/promises"
import { dirname, join } from "path"

/**
 * Check if a file exists.
 */
export async function fileExists(path) {
  try {
    return (await fs.stat(path)).isFile()
  } catch (e) {
    return false
  }
}

/**
 * Create & write a file
 */
export async function createFile(path, content = "") {
  try {
    await fs.mkdir(dirname(path), { recursive: true })
    await fs.writeFile(path, content)
  } catch (e) {
    console.error("writeFile error", e)
  }
}

/**
 * Remove a file.
 */
export async function removeFile(path) {
  const exist = await fileExists(path)
  if (!exist) {
    console.warn(`Can't remove file "${path}" because it doesn't exist. return.`)
    return
  }

  try {
    await fs.unlink(path)
  } catch (e) {
    return false
  }
}

/**
 * Read a file.
 */
export async function readFile(path) {
  try {
    return await fs.readFile(path).then((res) => res.toString())
  } catch (e) {
    console.error("readFile error", e)
  }
}

/**
 * Copy a file.
 * @param src Source path of the file to copy. ex: "src/index.ts"
 * @param dest Destination path of the file to copy. ex: "dist/index.ts" (specify the file name)
 * @param options
 * @returns
 */
export async function copyFile(src, dest, { transform, force } = {}) {
  if (!force) {
    const exist = await fileExists(dest)
    if (exist) {
      console.warn(
          `Can't copy file "${dest}" because it already exist on this destination. return.`
      )
      return
    }
  }
  if (transform) {
    let content = await fs.readFile(src).then((res) => res.toString())
    content = await transform(content)
    await createFile(dest, content)
  } else {
    await fs.mkdir(dirname(dest), { recursive: true })
    await fs.copyFile(src, dest)
  }
}

/**
 * Check if a directory exists.
 */
export async function dirExists(path) {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch (e) {
    return false
  }
}

/**
 * Read a directory.
 */
export async function readDir(path, recursive = true) {
  const ents = await fs.readdir(path, { withFileTypes: true })
  const results = await Promise.all(
      ents.map((ent) => {
        if (ent.isDirectory() && recursive) {
          return readDir(join(path, ent.name), recursive)
        } else {
          return join(path, ent.name)
        }
      })
  )
  return [...(results || [])].flat()
}

/**
 * Remove a directory.
 */
export async function removeDir(path) {
  const exist = await dirExists(path)
  if (!exist) {
    console.warn(`Can't remove "${path}" because it doesn't exist. return`)
    return
  }
  return await fs.rm(path, { recursive: true })
}

/**
 * Create a directory.
 */
export async function createDir(path) {
  return await fs.mkdir(path, { recursive: true })
}

/**
 *
 * @param src Source path of the directory to copy. ex: "src/compoents"
 * @param dest Destination path of the directory to copy. ex: "dist/compoents" (specify the directory name)
 * @param options
 */
export async function copyDir(src, dest, { force } = {}) {
  if (!force) {
    const exist = await dirExists(dest)
    if (exist) {
      console.error(
          `Can't copy folder "${dest}" because it already exist on destination. return`
      )
      return
    }
  }

  try {
    if (!(await fs.stat(src)).isDirectory()) throw new Error()
  } catch (e) {
    console.error("copyDir error", e)
  }

  const files = await readDir(src)
  await Promise.all(files.map((file) => copyFile(file, file.replace(src, dest))))
}
