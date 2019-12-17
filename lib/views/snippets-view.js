'use babel';

import { Pane } from 'atom';
import '../../node_modules/xterm/dist/addons/fit/fit';
import Term from './terminal';
import Pyserial from '../connections/pyserial';
import ApiWrapper from '../wrappers/api-wrapper';
import Logger from '../helpers/logger';

const EventEmitter = require('events');
const ElementResize = require('element-resize-detector');
fs = require('fs');
$ = require('jquery');

export default class SnippetsView extends EventEmitter {
  constructor(panelview, overlayview, settings) {
    super();
    const _this = this;
    this.api = new ApiWrapper(settings);
    this.package_folder = this.api.getPackageSrcPath();
    this.panelview = panelview;
    this.overlayview = overlayview;
    this.settings = settings;
    this.logger = new Logger('SnippetsView');
  }

  build(root_element) {
    const _this = this;
    $(document).ready(() => {
      const snippets_html = fs.readFileSync(`${_this.package_folder}/views/snippets-view.html`);
      root_element.append(snippets_html.toString());

      _this.list = $('#snippets-list');
      _this.snippet_name = $('#snippet-name');
      _this.content_right = $('#snippets-right');
      _this.snippets_description = $('#snippets-description');
      _this.button_insert = $('#snippets-button-insert');
      _this.button_create = $('#snippets-button-create');
      _this.button_new = $('#snippets-button-new');
      _this.content_display_box = $('#snippets-display-box');

      _this.plus = $('#snippets-plus');

      _this.panelview.on('snippets.created_new', (snippet) => {
        _this.addSnippetToList(snippet);
        _this.open(snippet);
      });

      _this.button_insert.on('click', () => {
        if (_this.selected_snippet) {
          _this.panelview.emit('snippet.insert', _this.selected_snippet.id, _this.getInputBoxContent());
        }
      });

      _this.button_create.on('click', () => {
        if (_this.selected_snippet) {
          _this.panelview.emit('snippet.create_file', _this.selected_snippet.id, _this.getInputBoxContent());
        }
      });

      _this.button_new.on('click', () => {
        if (_this.new_snippet) {
          _this.addNewSnippet();
        }
      });

      _this.plus.on('click', () => {
        _this.displayAddBox();
      });
    });
  }

  setContent(list) {
    const _this = this;

    this.list.html('');
    for (const i in list) {
      const item = list[i];
      this.addSnippetToList(item);
    }
    this.list.append('<li id="add-snippet" class="hidden"><input placeholder="Snippet name" /> </li>');
  }

  getInputBoxContent() {
    return this.content_display_box.val();
  }

  addSnippetToList(item) {
    const _this = this;
    // build list item
    const li_el = document.createElement('li');
    li_el.innerHTML = item.name;
    if (item.custom) {
      li_el.innerHTML += ' (custom)';
    }
    li_el.id = item.id;
    li_el.onclick = function (el, el2) {
      _this.panelview.emit('snippets.open', el.srcElement.id);
    };
    this.list.append(li_el);
  }

  open(snippet) {
    const _this = this;
    this.snippet_name.html(snippet.name);
    this.snippets_description.html(snippet.description);
    // $('#snippet-list li').removeClass()
    // $('.snippets #'+snippet.id).classList.add('selected')
    this.selected_snippet = snippet;
    this.content_display_box.val(snippet.code.toString());
  }

  displayAddBox() {
    this.new_snippet = {
      name: '',
      description: 'Custom snippet',
      id: '',
    };
    $('#add-snippet').removeClass('hidden');
    $('#snippets-button-new').removeClass('hidden');
    this.selected_snippet = null;
    this.snippet_name.html('New snippet');
    this.snippets_description.html('');
    this.content_display_box.val('');
  }

  addNewSnippet() {
    this.new_snippet.name = $('#add-snippet input').val();
    this.new_snippet.code = this.getInputBoxContent();
    this.panelview.emit('snippet.add_new', this.new_snippet);
    $('#add-snippet').addClass('hidden');
    $('#snippets-button-new').addClass('hidden');
  }
}