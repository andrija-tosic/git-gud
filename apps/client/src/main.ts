import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/html-hint';
import "codemirror/mode/clike/clike"
import "codemirror/mode/javascript/javascript"
import "codemirror/mode/python/python"

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
