/*
 * @Author: qiansc
 * @Date: 2018-11-19 18:13:17
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 00:14:28
 */
import { from, Observable } from "rxjs";
import { concatAll, filter, find, map, mergeAll, take } from "rxjs/operators";
import { parameter } from "./parameter";
import { IFunction, IParameter, ParameterConfig } from "./types";
import { YNode, YObject, YStatement } from "./ynodes";

export class YObservable extends YObject {
  constructor(private paramNodes: YObject[], private type: IFunction) {
    super("");
    let stack: string[] = [];
    let cache: string[] = [];
    paramNodes.forEach((node) => {
      if (node.value === "undefined") {
        cache.push(node.value);
      } else {
        stack = stack.concat(cache);
        stack.push(node.value);
        cache = [];
      }
    });
    this.value = type.name + "(" + stack.join(",") + ")";
  }
}

// export class YObservable extends YNode {
//   public static isObservableReturnType(type: string): string | false {
//     const match = type.match(/Observable\<(\w+)\>/);
//     return (match && match[1]) || false;
//   }
//   private parameters: ParameterConfig[];
//   constructor(private name: string, params: null | ParameterConfig | ParameterConfig[], private scope: Scope) {
//     super();
//     // do
//   }
//   // cp.forEach();
// }

/**
 * source:
 *  - fromHttp:
 *  - op...:
 *
 * source:
 *  - file
 *
 */

function uniqueKey(obj: any): string | false {
  const keys = Object.keys(obj);
  if (keys.length === 1) {return keys[0]; }
  return false;
}
function isObservableReturnType(type: string): string | false {
    const match = type.match(/Observable\<(\w+)\>/);
    return (match && match[1]) || false;
}

export function isObservable(opconf: any, nodes: YNode[] , dependences: IFunction[]): YObservable | YObject | false {
  // {fromHttp: "xx" / [..]} {source: null}
  const name = uniqueKey(opconf);
  if (!name) {return false; }

  const matchPrams = getTypesFromDeps(name, opconf[name], dependences); // fromHttp  "x", []
  if (matchPrams) {
    return new YObservable(matchPrams[0], matchPrams[1]);
  }
  let declared = false;
    // {source: null}
  nodes.forEach((node) => {
    if ((node instanceof YStatement) && node.name === name) { declared = true; }
  });
  if (declared) {return new YObject(name); }

  return false;
}

function getTypesFromDeps(name: string, params: null | ParameterConfig | ParameterConfig[],
                          dependences: IFunction[]): [YObject[], IFunction] | boolean {
  let result: YObject[] | boolean = false;
  let matchType: IFunction | boolean = false;
  if (params === null) {params = []; }
  if (!Array.isArray(params)) {params = [params]; }
  const parameters = params;
  from(dependences).pipe(
    // 匹配returnType
    map((f) => {matchType = f; return f; }),
    filter((f) => f.name === name && !!isObservableReturnType(f.returnType)),
    map((f) => matchParameters(f.parameters, parameters)),
    take(1),
  ).subscribe(
    (ynodes) => {
      result = ynodes;
    },
  );
  return (result && matchType ) ? [result, matchType as IFunction] : false;
}

function matchParameters(iParameters: IParameter[], configs: ParameterConfig[]): YObject[] {
  let params: any[] | false = [];
  from(iParameters).pipe( // 逐个比对parameters
    map((ip, i) => {
      if (configs[i] === undefined) {
        // 如果不是必选项目
        if (ip.hasQuestionToken) {return new YObject("undefined"); } else { params = false; }
      }
      return parameter(configs[i], ip);
    }),
  ).subscribe(
    (v) => {
      if (params) {params.push(v); }
    },
  );
  return params;
}
