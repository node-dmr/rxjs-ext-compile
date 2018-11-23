import * as FS from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { Observable } from "rxjs";
import { FunctionDeclaration, IndentationText, NewLineKind, Project, QuoteKind, SourceFile } from "ts-simple-ast";
import { Syntax as YSyntax } from "./syntax";
import { Config, IFunction, Scope } from "./types";

const dir = path.resolve(__dirname, "../../../");
const config = yaml.safeLoad(FS.readFileSync(path.resolve(dir, "configuration.yml"), "utf8"));

export class Compiler {
  private static unique(f: IFunction) {
    const u: string[] = [];
    u.push(f.name, f.type, f.returnType);
    f.parameters.forEach((p) => {
      u.push(p.type, p.hasQuestionToken.toString());
    });
    return u.join("-");
  }
  private scope: Scope;
  private project: Project;
  private sourceFile: SourceFile;

  constructor() {
    this.project = new Project({
      addFilesFromTsConfig: false,
      manipulationSettings: {
        // TwoSpaces, FourSpaces, EightSpaces, or Tab
        indentationText: IndentationText.FourSpaces,
        // LineFeed or CarriageReturnLineFeed
        newLineKind: NewLineKind.LineFeed,
        // Single or Double
        quoteKind: QuoteKind.Double,
      },
      tsConfigFilePath: path.resolve(dir, config.tsconfig),
      // useVirtualFileSystem: true,
    });
    this.sourceFile = this.project.createSourceFile("file.ts");
    this.scope = {
      dependences: [],
      sourceFile: this.sourceFile,
    };
  }

  public addDependence(arr: IFunction[]) {
    const map: {[index: string]: boolean} = {};
    this.scope.dependences.forEach((f) => {
      map[Compiler.unique(f)] = true;
    }),
    arr.forEach((f) => {
      if (!map[Compiler.unique(f)]) {
        map[Compiler.unique(f)] = true;
        this.scope.dependences.push(f);
      }
    });
  }

  public parse(conf: any): Observable<any> | undefined {
    if (!conf.start) { throw new Error("start does not exits!\n" + JSON.stringify(conf)); }
    console.log(conf);
    console.log("--------");
    const syntax = new YSyntax(conf, this.scope.dependences);
    syntax.getTypescriptWriter().write(this.sourceFile);
    this.sourceFile.formatText();

    console.log(this.sourceFile.getText());
    const p = this.project.getPreEmitDiagnostics();
    console.log(this.project.formatDiagnosticsWithColorAndContext(p));
    return;
  }
}
