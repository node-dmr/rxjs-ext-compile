/*
 * @Author: qiansc
 * @Date: 2018-11-22 19:14:12
 * @Last Modified by:   qiansc
 * @Last Modified time: 2018-11-22 19:14:12
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
