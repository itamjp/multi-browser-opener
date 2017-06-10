"use strict";
/**
 * $IF モジュール
 *
 * @module  {$IF}   $IF
 * @class   {$IF}
 */
module.exports = new (function $IF() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * 相対ディレクトリ用RE
     *
     * @type    {RegExp}
     */
    let REBase = null;

    /**
     * アイコン
     *
     * @type    {Object}
     */
    const ICONFILES = {
        APP:        './img/icon-ifollow-16.png',
        DEV:        './img/icon-ifollow-debug-16.png',
        MENU:       './img/icon-menu-16.png',
        PROPERTY:   './img/icon-property-16.png',
        CONFIG:     './img/icon-config-16.png',
        DEBUG:      './img/icon-debug-16.png',
        ABOUT:      './img/icon-question-16.png',
        CLOSE:      './img/icon-stop-16.png',
        QUIT:       './img/icon-switch-16.png',
        RESTART:    './img/icon-refresh-16.png',

        HOME:       './img/icon-home-16.png',
        PRINTER:    './img/icon-printer-16.png',

        CUT:        './img/icon-cut-16.png',
        COPY:       './img/icon-copy-16.png',
        PASTE:      './img/icon-paste-16.png',
        UNDO:       './img/icon-undo-16.png',
        REDO:       './img/icon-redo-16.png',
        PREV:       './img/icon-prev-16.png',
        NEXT:       './img/icon-next-16.png',
    };

    // -------------------------------------------------------------------------
    /**
     * 初期化
     *
     * @method
     * @return  {Boolean}   true
     */
    const _init = function _init() {
        // ベースのライブラリ
        Object.defineProperty(global, '$IF', {
            value:          self,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'Electron', {
            value:          require('electron'),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        // renderプロセスではappは取得できない
        let app       = null;
        let dialog    = null;
        if ( process.type === 'renderer' ) {
            app       = Electron.remote.app;
            dialog    = Electron.remote.dialog;
        } else {
            app       = Electron.app;
            dialog    = Electron.dialog;
        }
        Object.defineProperty(global, 'App', {
            value:          app,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'Dialog', {
            value:          dialog,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'Path', {
            value:          require('path'),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'FS', {
            value:          require('fs'),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'Util', {
            value:          require('util'),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'SEP', {
            value:          Path.sep,
            writable:       false,
            enumerable:     false,
            configurable:   true,
        });
        Object.defineProperty(global, 'EOL', {
            value:          "\n", // require('os').EOL,
            writable:       false,
            enumerable:     false,
            configurable:   true,
        });
        Object.defineProperty(global, 'TAB', {
            value:          "\t",
            writable:       false,
            enumerable:     false,
            configurable:   true,
        });

        // 自動定数の定義
        const getters = {
            __STACK__:      _getStack,
            __LINE__:       _getLine,
            __FILE__:       _getFilename,
            __DIR__:        _getDirname,
            __FUNCTION__:   _getFunction,
            __CLASS__:      _getClass,
            __METHOD__:     _getMethod,
            __HERE__:       _getHere,
            __CWD__:        _getCWD,
        };
        for ( let name in getters ){
            Object.defineProperty(global, name, {
                get:            getters[name],
                // writable:       false,
                enumerable:     true,
                configurable:   true,
            });
        }
        Object.defineProperty(global, '__BASE__', {
            value:          Path.resolve(__DIR__ + SEP + '..'),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, '__DATA__', {
            value:          App.getPath('userData'),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, '__PRODUCT__', {
            value:          App.getName() + '/' + App.getVersion(),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, '__PRODUCT_NAME__', {
            value:          App.getName(),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, '__PRODUCT_VERSION__', {
            value:          App.getVersion(),
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(global, 'alert', {
            value:          _alert,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        REBase        = new RegExp(('^' + __BASE__ + SEP).replace(/\\/g, '\\\\'));

        // 公開メソッド
        Object.defineProperty(self, 'get', {
            value:          _getModule,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(self, 'getMain', {
            value:          _getModuleMain,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(self, 'restart', {
            value:          _restart,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });
        Object.defineProperty(self, 'quit', {
            value:          _quit,
            writable:       false,
            enumerable:     true,
            configurable:   true,
        });

        // アイコン
        Object.defineProperty(global, 'ICONS', {
            value:          {},
            writable:       false,
            enumerable:     false,
            configurable:   true,
        });
        for ( let key in ICONFILES ) {
            Object.defineProperty(ICONS, key, {
                value:          Path.resolve(__BASE__ + SEP + ICONFILES[key]),
                writable:       false,
                enumerable:     true,
                configurable:   true,
            });
        }
        return true;
    };

    /**
     * モジュールを取得する
     *
     * @method
     * @param   {String}    モジュール名
     * @return  {Object}    モジュール
     */
    const _getModule = function _getModule(name) {
        const file = Path.resolve(__BASE__ + SEP + name);
        return require(file);
    };

    /**
     * mainプロセスのモジュールを取得する
     *
     * @method
     * @param   {String}    モジュール名
     * @return  {Object}    モジュール
     */
    const _getModuleMain = function _getModuleMain(name) {
        const file = Path.resolve(__BASE__ + SEP + name);
        let module = null;
        if ( process.type === 'renderer' ) {
            module = Electron.remote.require(file);
        } else {
            module = require(file);
        }
        return module;
    };

    /**
     * スタックを取得する
     *
     * @method
     * @return  {Array}     スタック
     */
    const _getStack = function _getStack() {
        const orig              = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => { return stack; };
        const err               = new Error;
        Error.captureStackTrace(err);
        const stack             = err.stack;
        Error.prepareStackTrace = orig;
        stack.shift();
        return stack;
    };

    /**
     * 行番号を取得する
     *
     * @method
     * @return  {Number}    行番号
     */
    const _getLine = function _getLine() {
        return __STACK__[1].getLineNumber();
    };

    /**
     * ファイル名を取得する
     *
     * @method
     * @return  {String}    ファイル名
     */
    const _getFilename = function _getFilename() {
        return __STACK__[1].getFileName() || '(anonymous)';
    };

    /**
     * ディレクトリ名を取得する
     *
     * @method
     * @return  {String}    ディレクトリ名
     */
    const _getDirname = function _getDirname() {
        return Path.dirname(__STACK__[1].getFileName() || '(anonymous)');
    };

    /**
     * 関数名を取得する
     *
     * @method
     * @return  {String}    関数名
     */
    const _getFunction = function _getFunction() {
        return __STACK__[1].getFunctionName() || '(anonymous)';
    };

    /**
     * クラス名を取得する
     *
     * @method
     * @return  {String}    クラス名
     */
    const _getClass = function _getClass() {
        return __STACK__[1].getTypeName() || '(anonymous)';
    };

    /**
     * メソッド名を取得する
     *
     * @method
     * @return  {String}    メソッド名
     */
    const _getMethod = function _getMethod() {
        let aOut   = [];
        let sClass = __STACK__[1].getTypeName();
        if ( sClass ) {
            aOut.push(sClass);
            aOut.push('.');
            aOut.push(__STACK__[1].getFunctionName()           || '(anonymous)');
        } else {
            aOut.push(_getRelative(__STACK__[1].getFileName()) || '(anonymous)');
            sClassSep  = '::';
            aOut.push(__STACK__[1].getFunctionName()           || '(anonymous)');
        }
        return aOut.join('');
    };

    /**
     * 現在の場所を取得する
     *
     * @method
     * @return  {String}    現在の場所
     */
    const _getHere = function _getHere() {
        let aOut   = [];
        let sClass = __STACK__[1].getTypeName();
        if ( sClass ) {
            // クラス形式
            aOut.push(sClass);
            aOut.push('.');
            aOut.push(__STACK__[1].getFunctionName()           || '(anonymous)');
            aOut.push(':');
            aOut.push(__STACK__[1].getLineNumber());
        } else {
            // ファイル形式
            aOut.push(_getRelative(__STACK__[1].getFileName()) || '(anonymous)');
            aOut.push(':');
            aOut.push(__STACK__[1].getFunctionName()           || '(anonymous)');
            aOut.push(':');
            aOut.push(__STACK__[1].getLineNumber());
        }
        return aOut.join('');
    };

    /**
     * パスを相対パスにする
     *
     * @method
     * @return  {String}    相対パス
     */
    const _getRelative = function _getRelative(sPath) {
        if ( sPath ) {
            sPath = sPath.replace(REBase, '.' + SEP);
        }
        return sPath;
    };

    /**
     * カレントディレクトリ名を取得する
     *
     * @method
     * @return  {String}    カレントディレクトリ
     */
    const _getCWD = function _getCWD() {
        return process.cwd();
    };

    /**
     * カレントディレクトリ名を取得する
     *
     * @method
     * @return  {String}    カレントディレクトリ
     */
    const _alert = function _alert(message, title, type) {
        const types   = {
            'info':     'info',
            'error':    'error',
            'question': 'question',
            'warning':  'warning',
            'none':     'none',
        };
        if ( ( type in types ) === false ) {
            type      = 'info';
        }
        const options = {
            type:       type,
            buttons:    [ 'OK' ],
            title:      (title   || 'Information') + ' - ' + App.getName(),
            message:    '' + (message || '(no message)'),
        };
        return Dialog.showMessageBox(options);
    };

    /**
     * 再起動処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _restart = function _restart() {
        // MainControllerを呼び出して終了する
        const MainController = _getModuleMain('./libs/MainController.js');
        return MainController.restart();
    };

    /**
     * 終了処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _quit = function _quit() {
        // MainControllerを呼び出して終了する
        const MainController = _getModuleMain('./libs/MainController.js');
        return MainController.quit();
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
