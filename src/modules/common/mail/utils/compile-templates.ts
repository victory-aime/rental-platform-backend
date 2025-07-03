import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CompileTemplateService {
  compileTemplate(templatePath: string, context: Record<string, any>) {
    const fullPath = path.resolve(
      './src/modules/common/mail/templates/',
      templatePath + '.hbs',
    );
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Template file not found: ${fullPath}`);
    }
    const templateSource = fs.readFileSync(fullPath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(context);
  }
}
