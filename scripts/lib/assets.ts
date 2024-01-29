import fs from 'fs/promises'
import path from 'path'
import prettier from 'prettier'
import {stableJson} from '.'

const assetsDir = path.resolve(__dirname, '../../assets')

export async function read(name: string) {
  const fullName = path.resolve(assetsDir, name)
  return await fs.readFile(fullName, {encoding: 'utf8'})
}

export async function readJson<T = unknown>(name: string) {
  const content = await read(name)
  return JSON.parse(content) as T
}

export async function write(name: string, content: string) {
  const fullName = path.resolve(assetsDir, name)
  await fs.mkdir(path.dirname(fullName), {recursive: true})
  return await fs.writeFile(fullName, content, {encoding: 'utf8'})
}

export async function writeHtml(name: string, html: string) {
  const pretty = await prettier.format(html, {filepath: name})
  return await write(name, pretty)
}

export async function writeJson(name: string, data: any) {
  const content = stableJson(data, {indent: 2})
  return await write(name, content)
}
