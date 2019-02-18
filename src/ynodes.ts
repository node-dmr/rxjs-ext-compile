/*
 * @Author: qiansc
 * @Date: 2018-11-22 19:14:12
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 12:46:41
 */

export class YNode {
  constructor() {
    // do nothing
  }
}

export class YStatement extends YNode {
  constructor(public name: string, public variable: YNode) {super(); }
}

export class YString extends YNode {
  constructor(public value: string) {super(); }
}

export class YObject extends YNode {
  constructor(public value: string) {super(); }
}

export class YImport extends YNode {
  private funcs: string[] = [];
  constructor(public module: string) {super(); }
  public push(funName: string) {
   if (this.funcs.indexOf(funName) === -1) {this.funcs.push(funName); }
  }
  public each(func: (fun: string) => void) {
    this.funcs.sort();
    this.funcs.forEach(func);
  }
}
