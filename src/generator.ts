/*
 * @Author: qiansc
 * @Date: 2018-11-23 16:09:56
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 19:43:22
 */
import { from, Observable } from "rxjs";
import { concatAll, filter, find, map, mergeAll, take } from "rxjs/operators";
import { PipeAble, YObservable } from "./observable";
import { YOperator } from "./operator";
import { parameter } from "./parameter";
import { Syntax } from "./syntax";
import { IFunction, IParameter, ParameterConfig } from "./types";
import { YNode, YObject, YStatement } from "./ynodes";

export function generateObservable(opconf: any, syntax: Syntax) {
  return generate(opconf, syntax) as (YObservable | PipeAble | false);

}

export function generateOperator(obconf: any, syntax: Syntax) {
  return generate(obconf, syntax) as (YOperator | false);
}

function uniqueKey(obj: any): string | false {
  const keys = Object.keys(obj);
  if (keys.length === 1) {return keys[0]; }
  return false;
}
function isObservableReturnType(type: string): string[] | false {
    const match = type.match(/(Observable|OperatorFunction)\<([^>]+)\>/);
    return (match && [match[1] , match[2]]) || false;
}

export function generate(opconf: any, syntax: Syntax): YObservable | YOperator | PipeAble | false {
  const nodes: YNode[] = syntax.nodes;
  const dependences: IFunction[] = syntax.deps;
  // {fromHttp: "xx" / [..]} {source: null}
  const name = uniqueKey(opconf);
  if (!name) {return false; }

  const matchPrams = getTypesFromDeps(name, opconf[name], dependences); // fromHttp  "x", []
  if (matchPrams) {
    syntax.getYImport(matchPrams[1].module).push(matchPrams[1].name);
    const rT = isObservableReturnType((matchPrams[1] as IFunction).returnType)[0];
    if ( rT === "Observable") {
      return new YObservable(matchPrams[0], matchPrams[1]);
    } else if (rT === "OperatorFunction") {
      return new YOperator(matchPrams[0], matchPrams[1]);
    } else {
      return false;
    }

  }
  let declared = false;
    // {source: null}
  nodes.forEach((node) => {
    if ((node instanceof YStatement) && node.name === name) { declared = true; }
  });
  if (declared) {
    return new PipeAble(name);
  }

  return false;
}

function getTypesFromDeps(name: string, params: null | ParameterConfig | ParameterConfig[],
                          dependences: IFunction[]): [YObject[], IFunction] | boolean {
  let result: YObject[] | boolean = false;
  let matchType: IFunction | boolean = false;
  let tmpType: IFunction | boolean = false;
  if (params === null) {params = []; }
  if (!Array.isArray(params)) {params = [params]; }
  const parameters = params;
  from(dependences).pipe(
    // 匹配returnType
    map((f) => {tmpType = f; return f; }),
    // map((v) => {console.log(!!isObservableReturnType(v.returnType)); return v; }),
    filter((f) => f.name === name && !!isObservableReturnType(f.returnType)),
    map((f) => matchParameters(f.parameters, parameters)),
  ).subscribe(
    (ynodes) => {
      matchType = tmpType;
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
