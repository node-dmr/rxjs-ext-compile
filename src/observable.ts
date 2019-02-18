/*
 * @Author: qiansc
 * @Date: 2018-11-19 18:13:17
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 19:36:41
 */
import { from, Observable } from "rxjs";
import { concatAll, filter, find, map, mergeAll, take } from "rxjs/operators";
import { YOperator } from "./operator";
import { parameter } from "./parameter";
import { Syntax } from "./syntax";
import { IFunction, IParameter, ParameterConfig } from "./types";
import { YNode, YObject, YStatement } from "./ynodes";

export class PipeAble extends YObject {
  protected main: string = "";
  protected operators: YOperator[] = [];
  constructor(value: string) {
    super(value);
    this.main = value;
  }
  public pipe(op: YOperator) {
    this.operators.push(op);
    this.updateText();
  }
  protected updateText() {
    const opstring: string[] = [];
    this.operators.forEach((op) => {
      opstring.push(op.value);
    });
    this.value = this.main + (this.operators.length ? `.pipe(\n${opstring.join(",\n")}\n)` : "") ;
  }
}

export class YObservable extends PipeAble {
  constructor(private paramNodes: YObject[], public type: IFunction) {
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
    this.main = type.name + "(" + stack.join(",") + ")";
    this.updateText();
  }
}
