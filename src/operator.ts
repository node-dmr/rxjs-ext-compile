import { from, Observable } from "rxjs";
import { concatAll, filter, find, map, mergeAll, take } from "rxjs/operators";
import { parameter } from "./parameter";
import { Syntax } from "./syntax";
import { IFunction, IParameter, ParameterConfig } from "./types";
import { YNode, YObject, YStatement } from "./ynodes";

export class YOperator extends YNode {
  public value: string = "";
  constructor(private paramNodes: YObject[], public type: IFunction) {
    super();
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
