/*
 * @Author: qiansc
 * @Date: 2018-11-23 09:14:33
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 12:21:28
 */
import * as findup from "findup-sync";
import * as yaml from "js-yaml";
import { Compiler } from "./compiler";

export function reslove(config: string, tsconfigPath?: string) {
  const conf = yaml.safeLoad(config);
  const tsconfig = tsconfigPath || findup("tsconfig.json");
  const compiler = new Compiler({tsconfig});
  conf.import = Array.isArray(conf.import) ? conf.import : [];
  if ((conf.import as string[]).indexOf("rxjs-ext") === -1) {conf.import.push("rxjs-ext"); }
  (conf.import as string[]).forEach((module) => {
    const filepath = findup(`node_modules/${module}/dist/configurable.json`);
    compiler.addDependence(require(filepath), module);
  });
  delete conf.tsconfig;
  compiler.parse(conf);
}
