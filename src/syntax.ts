/*
 * @Author: qiansc
 * @Date: 2018-11-22 09:55:22
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 19:05:44
 */

import { generateObservable, generateOperator } from "./generator";
import { YObservable } from "./observable";
import { TsWriter } from "./tsWriter";
import { IFunction } from "./types";
import { YImport, YNode, YStatement, YString} from "./ynodes";

export class Syntax {
  public nodes: YNode[] = [];
  private imports: YImport[] = [];

  constructor(conf: JSON, public deps: IFunction[]) {
    this.parseJSON(conf);
  }
  public isStatement(key: string, value: any): YStatement | false {
    if (!Array.isArray(value)) {
      return new YStatement(key, new YString(JSON.stringify(value)));
    }
    const nexts = [...value];
    const ob = generateObservable(nexts.shift(), this);
    if (ob) {
      if (nexts.length) {
        nexts.forEach((opc) => {
          const op = generateOperator(opc , this);
          if (op) {
            ob.pipe(op);
          } else {
            throw new Error("Operator Config Error: " + JSON.stringify(opc));
          }
        });
      }
      return new YStatement(key, ob);
    }
    return false;
  }

  public getType(name: string) {
    // do
  }
  public getYImport(module: string) {
    let yi: YImport | false = false;
    this.imports.forEach((i) => {
      if (i.module === module) {yi =  i; }
    });
    if (!yi) {
      yi = new YImport(module);
      this.imports.push(yi);
    }
    return  yi;
  }

  public parseJSON(json: JSON) {
    Object.keys(json).forEach((key) => {
      const statement = this.isStatement(key, json[key]);
      if (statement) {this.nodes.push(statement); }
    });
  }
  public getTypescriptWriter(): TsWriter {
    return new TsWriter(([] as YNode[]).concat(this.imports).concat(this.nodes));
  }

}

// "statement", name, variable, declare, scope: text
// "variable"
// "string"
// Regexp
// function
// observerable
// action variable|name func | params
//

// value 数组形式 -> 否 当expr处理
//       -> 是 分析第一项目是否ob实例 是待处理对象 化为string
//            分析第一项目是否ob 是待处理对象 化为func-string 失败直接错
//       是否有op[] -> 否 返回待处理
//            -> 是 逐步遍历
//            -> 某一层失败直接错（没匹配到，参数转换错误）
//               * 比较returnType， 比较参数
//                 参数可能还是ob 或者 op 等嵌套了
//           给出了很多opname param[]
//           pipel链接待处理对象及opname param[]

// variableStatement -> expr any ,expr ob[.pipe(...op)], 表达式要pipe
// observerable -> ob
// oprater -> op string
//     varaiable(val, type)    各种类型
//         -> regexp
//         -> function
//         -> operater
