/*
 * @Author: qiansc
 * @Date: 2018-11-22 13:15:13
 * @Last Modified by: qiansc
 * @Last Modified time: 2018-11-23 12:54:01
 */
import { SourceFile, VariableDeclarationKind } from "ts-simple-ast";
import { YImport, YNode, YObject, YStatement, YString } from "./ynodes";

export class TsWriter {
  private sourceFile: SourceFile;
  constructor(private nodes: YNode[]) { }
  public write( sourceFile: SourceFile) {
    this.sourceFile = sourceFile;
    this.nodes.forEach((node) => {
      this.writeNode(node);
    });
    // do
  }
  private writeNode(node: YNode) {
    if (node instanceof YImport) {
      this.writeImport(node);
    } else if (node instanceof YStatement) {
      this.writeStatement(node);
    }
  }
  private writeStatement(node: YStatement) {
    const declared = this.sourceFile.getVariableDeclaration((v) => v.getName() === node.name);
    const variableStatement = this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
        declarations: [{
          initializer: this.getVariableText(node.variable),
          name: node.name,
        }],
    });
    if (declared) {
      this.sourceFile.getVariableStatement((s) => {
        s.getDeclarations().forEach((d) => {
          if (d.getName() === node.name) {
            if (s.getDeclarationKind() === VariableDeclarationKind.Const) {
              s.setDeclarationKind(VariableDeclarationKind.Let);
            } else if (s.getDeclarationKind()) {
              s.replaceWithText(s.getText().replace(/^(const|let)\s/, ""));
            }
          }
        });
        return false;
      });
      variableStatement.replaceWithText(variableStatement.getText().replace(/^(const|let)\s/, ""));
    }
  }

  private writeImport(ip: YImport) {
    const arr: string[] = [];
    ip.each((f) => {
      arr.push(f);
    });
    this.sourceFile.addImportDeclaration({
      // defaultImport?: string;
      // namespaceImport?: string;
      moduleSpecifier: ip.module,
      namedImports: arr,
    });
  }

  private getVariableText(node: YNode) {
    if (node instanceof YStatement) {
      this.writeStatement(node);
      return node.name;
    } else if (node instanceof YString) {
      return node.value;
    } else if (node instanceof YObject) {
      return node.value;
    }
  }

}
