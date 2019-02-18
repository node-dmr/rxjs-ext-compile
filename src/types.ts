import { SourceFile } from "ts-simple-ast";

export interface IFunction {
  module: string;
  name: string;
  parameters: IParameter[];
  returnType: string;
  type: "Function";
}

export interface IParameter {
  hasQuestionToken: boolean;
  name: string;
  type: string;
}

/**
 *   - lev0
 *     - startWithout$
 *       - Object/array -> lev + 递归
 *     - startWith$
 *      - first: ob: startWith$ / op + paramer
 *      - fllowing:
 *          - each
 */

//
// $origin:
//   - fromHttp: "https://www.baidu.com/"
//   - line:

// export:
//   - $origin

export interface Config {
  [name: string]:
    // index startWithout$
    any |
    // index startWith$, should be ob + ops
    [
      ObservableConfig,
      ...OperationConfig[]
    ];
  export: any;
}
export interface ObservableConfig {
  [name: string]: null | ParameterConfig | ParameterConfig[];
}
export interface OperationConfig {
  [name: string]: null | ParameterConfig | ParameterConfig[];
}

export type ParameterConfig = string;

export interface Scope {
  dependences: IFunction[];
  sourceFile: SourceFile;
}
