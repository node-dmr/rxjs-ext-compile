/*
 * @Author: qiansc
 * @Date: 2018-11-22 22:29:09
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 00:00:41
 */
import { IFunction, IParameter, ParameterConfig } from "./types";
import { YNode, YObject, YStatement } from "./ynodes";

export function parameter(val: any, ip: IParameter): YObject {
  const types = (ip.type || "").split(" | ");
  /*
    * 基于值类型推断: 正则 / () => {}
    * 基于Type判断 唯一正则、唯一方法、Operation、others(string, [], object)
    *
    */
  if (typeof val === "string" && val.match(/\/.*\/[imlxg]*$/)) {
    // 优先值匹配正则推断
    if (types.indexOf("RegExp") > -1) {return new YObject(val); }
  }
  try {
    if (typeof eval.apply(null, val) === "function") {
      if (isFunction(types)) {
        return new YObject(val);
      }
    }
  } catch (e) {
    // do nothing
  }
  if (types.indexOf("boolean") > -1 && typeof val === "boolean") {return new YObject(val.toString()); }
  if (types.indexOf("number") > -1 && typeof val === "number") {return new YObject(val.toString()); }
  if (types.indexOf("string") > -1) {return new YObject(JSON.stringify(val)); }
  return new YObject(JSON.stringify(val));
}

function isFunction(types: string[]) {
  let rs: boolean = false;
  types.forEach((type) => {
    if (type.match(/(Function|Operation)$/)) {
      rs = true;
    } else if (type.match(/^[\S]*(.*)[\S]*=>/)) {
      rs = true;
    }
  });
  return rs;
}
