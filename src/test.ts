/*
 * @Author: qiansc
 * @Date: 2018-11-19 14:39:47
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 12:52:55
 */

import * as yaml from "js-yaml";
import {Compiler} from "./compiler";
const rxjsExt = require("../../../dist/configurable.json");
const str = `
scope:
  combined: ssss

source:
  - fromHttp: "https://www.baidu.com/"
  - line:

start:
  - source:

`;

/**
 *   - lev0
 *     - startWithout$
 *       - Object/array -> lev + 递归
 *     - startWith$
 *      - first: ob: startWith$ / op + paramer
 *      - fllowing:
 *          - each
 */

const conf = yaml.safeLoad(str);

// console.log(conf);

const compiler = new Compiler();

compiler.addDependence(rxjsExt, "");
compiler.parse(conf);
