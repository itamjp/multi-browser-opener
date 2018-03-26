"use strict";
/**
 * EachWindow モジュール
 *
 * @module  {EachWindow}    EachWindow
 * @class   {EachWindow}
 */
module.exports = new (function EachWindow() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * Config
     *
     * @type    {Config}
     */
    const Config = $IF.get('./libs/Config.js');

    /**
     * ウィンドウ
     *
     * @type    {Object}
     */
    const Stored = {};

    /**
     * WindowIds
     *
     * @type    {Object}
     */
    const WindowIds = {};

    // -------------------------------------------------------------------------
    /**
     * 初期化
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _init = function _init() {
        return true;
    };

    /**
     * ウィンドウを最大化する処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleMaximize = function _handleMaximize(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each !== null ) {
            each.pos.state = 'maximize';
        }
        return true;
    };

    /**
     * ウィンドウの最大化を解除する処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleUnmaximize = function _handleUnmaximize(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each !== null ) {
            each.pos.state = 'normal';
        }
        return true;
    };

    /**
     * ウィンドウをリストアする処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleRestore = function _handleRestore(event) {
    };

    /**
     * ウィンドウをリサイズする処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleResize = function _handleResize(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each !== null ) {
            Object.assign(each.pos, each.window.getBounds());
        }
        return true;
    };

    /**
     * ウィンドウを移動する処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleMove = function _handleMove(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each !== null ) {
            Object.assign(each.pos, each.window.getBounds());
        }
        return true;
    };

    /**
     * ウィンドウを最小化する処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleMinimize = function _handleMinimize(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each !== null ) {
            _savePosition(each.name, each.pos, each.state);
            this.hide();
        }
        return true;
    };

    /**
     * ウィンドウを閉じる処理(hide)
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleClose = function _handleClose(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each === null ) {
            return true;
        }
        if ( each.canClose !== true ) {
            event.preventDefault();
            this.minimize();
            return false;
        }
        _savePosition(each.name, each.pos, each.state);
        return true;
    };

    /**
     * ウィンドウにフォーカスが乗った処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleFocus = function _handleFocus(event) {
        const each  = Stored[WindowIds[this.id]];
        if ( each === null ) {
            return true;
        }
        const name  = each.name;
        return _saveWindowName(each.name);
    };

    /**
     * トレイアイコンに最後のフォーカスのウィンドウを保持させる
     *
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     * @private
     */
    const _saveWindowName = function _saveWindowName(name) {
        $IF.get('./libs/TrayIcon.js').setWindowName(name);
        return true;
    };

    /**
     * ウィンドウ位置を取得する
     *
     * @method
     * @param   {Object}        options
     * @private
     */
    const _loadPosition = function _loadPosition(options) {
        let pos  = options.pos || {};
        pos      = Object.assign({
            x:      null,
            y:      null,
            width:  500,
            height: 500,
            center: true,
            state:  'normal',
        }, pos);
        return pos;
    };

    /**
     * ウィンドウ位置を保存する
     *
     * @method
     * @param   {String}    name
     * @param   {Object}    pos
     * @param   {String}    state
     * @return  {Boolean}   true
     * @private
     */
    const _savePosition = function _savePosition(name, pos, state) {
        const conf       = Config.getAccountInfo(name);
        let   saveflag   = false;
        if ( pos ) {
            conf.pos     = pos;
            saveflag     = true;
        }
        if ( state === 'maximize' || state === 'minimize' || state === 'normal' ) {
            conf.state   = state;
            saveflag     = true;
        }
        if ( saveflag !== true ) {
            return false;
        }
        conf.pos.center  = false;
        Config.setAccountInfo(name, conf);
        Config.save();
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * ウィンドウを生成する
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @param   {Object}    options
     * @return  {Boolean}   true
     */
    self.create = function create(name, options) {
Log.info(__HERE__);
        // 必ず文字列にする
        name              = '' + name;
        if ( name === '' ) {
            throw new Error('Invalid name of account. [' + name + ']');
        }
        // 既にあるならば作らない
        if ( name in Stored ) {
            return true;
        }
        // アカウント情報を読み込み
        const conf        = Config.getAccountInfo(name);
        if ( conf === null ) {
            throw new Error("Can't find name in account. [" + name + "]");
        }
        if ( name in Stored ) {
            // あれば終わり
            return true;
        }
        // ウィンドウを生成
        Log.info('Create each window for "' + name + '" [pid=' + process.pid + ']');
        const pos         = _loadPosition(conf);
        const win         = new Electron.BrowserWindow({
            width:                  pos.width,
            height:                 pos.height,
            x:                      pos.x,
            y:                      pos.y,
            useContentSize:         false,
            center:                 pos.center,
            resizable:              true,
            closable:               true,
            title:                  name,
            icon:                   Path.resolve(__DATA__ + SEP + conf.icon),
            show:                   false,
            frame:                  true,
            autoHideMenuBar:        true,
            webPreferences:         {
                nodeIntegration:    true,
                defaultFontFamily:  {
                    standard:       'Meiryo UI',
                    serif:          'MS PMincho',
                    sansSerif:      'Meiryo UI',
                    monospace:      'MS Gothic'
                },
                webgl:              true,
                webaudio:           true,
                plugins:            false,
                defaultEncoding:    'UTF-8',
            },
        });
        switch ( pos.state ) {
            case 'maximize':
                win.maximize();
                break;
            case 'minimize':
                win.minimize();
                break;
            default:
                // 最大化も最小化もリストアもしない
                pos.state = 'normal';
                break;
        }
        // ウィンドウ操作系のイベント処理
        win.on('maximize',    _handleMaximize);     // 通常 → 最大化 or 最小化 → 最大化
        win.on('unmaximize',  _handleUnmaximize);   // 最大化 → 通常
        win.on('restore',     _handleRestore);      // 非表示 → show (最小化のままもあり)
        win.on('resize',      _handleResize);       // 通常
        win.on('move',        _handleMove);         // 通常

        win.on('minimize',    _handleMinimize);
        win.on('close',       _handleClose);
//             win.on('app-command', _handleAppCommand);
        win.on('focus',       _handleFocus);
//             _initWebContents(win.webContents, name);
        const url         = __BASE__ + SEP + 'webview.html?' + win.id;
        win.loadURL(url);
//             MenuBuilder   = MenuBuilder || require('./MenuBuilder');
//             var menu      = Menu.buildFromTemplate([
//                 MenuBuilder.getAppFile(hash),
//                 MenuBuilder.getAppEdit(),
//             ]);
//             MenuBuilder.updateCanGoBack(menu, false, false);
        win.setMenu(null);
        const each        = {
            name:        name,
            id:          win.id,
            window:      win,
            canClose:    false,
//             menu:        menu,
            pos:         pos,
            webview:     -1,
            home:        conf.svcurl,
        };
        Stored[name]      = each;
        WindowIds[win.id] = name;
        win.show();
//         _saveWindowName(name);
        return true;
    };

    /**
     * webviewのidをセットする
     *
     * @method
     * @param   {String}    name
     * @param   {Number}    webviewid
     * @return  {Boolean}   true
     * @public
     */
    self.setWebviewId = function setWebviewId(name, id) {
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        Stored[name].webview = id || -1;
        return true;
    };

    /**
     * ウィンドウを閉じる処理
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     */
    self.close = function close(name) {
Log.info(__HERE__);
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        Stored[name].canClose = true;
        Stored[name].window.close();
        return true;
    };

    /**
     * ウィンドウを表示する
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     */
    self.show = function show(name) {
Log.info(__HERE__);
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        if ( Stored[name].window.isVisible() === true ) {
            // 表示されているので何もしない
            Stored[name].window.focus();
            return true;
        }
        if ( Stored[name].pos.state === 'maximize' ) {
            // 前回が最大化
            Stored[name].window.maximize();
        } else {
            // 前回が通常
            if        ( Stored[name].window.isMaximized() === true ) {
                // 最大化されていたら元に戻す
                Stored[name].window.unmaximize();
            } else if ( Stored[name].window.isMinimized() === true ) {
                // 最小化されていたら元に戻す
                Stored[name].window.restore()
            } else {
                // それ以外は何もしない
            }
        }
        Stored[name].window.show();
        Stored[name].window.focus();
        return true;
    };

    /**
     * ウィンドウを閉じる処理
     *
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     * @public
     */
    self.hide = function hide(name) {
Log.info(__HERE__);
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        if ( Stored[name].window.isVisible() === false ) {
            // 表示されていないので何もしない
            return true;
        }
        // 最小化する
        Stored[name].window.minimize();
        return true;
    };

    /**
     * ウィンドウを閉じる処理
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     */
    self.destroy = function destroy(name) {
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        const id                     = Stored[name].id;
        if ( Stored[name].window.isVisible() === true ) {
            // 表示されている場合のみ位置を保存する
            if        ( Stored[name].window.isMaximized() !== true ) {
                // 最大化されている
                _savePosition(name, null, 'maximize');
            } else if ( Stored[name].window.isMinimized() !== true ) {
                // 最小化されている → 何もしない
            } else {
                // それ以外
                _savePosition(name, Stored[name].window.getBounds(), 'normal');
            }
        }
        Stored[name].canClose = true;
        Stored[name].window.destroy();
        // メモリ使用量を解放 → 保存はWebView::_handleInitWebContentsで行う
        // MemoryUsage.clear('each:' + each.name);
        for ( let i in Stored[name] ) {
            delete Stored[name][i];
        }
        delete Stored[name];
        delete WindowIds[id];
        Log.info('Close each window for "' + name + '" [pid=' + process.pid + ']');
        return true;
    };

    /**
     * タイトルをセットする
     *
     * @method
     * @param   {String}    name
     * @param   {String}    title
     * @return  {Boolean}   true
     * @public
     */
    self.setTitle = function setTitle(name, title) {
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        Stored[name].window.setTitle('' + title);
        return true;
    };

    /**
     * ポップアップメニューを表示する
     *
     * @method
     * @param   {String}    name
     * @param   {String}    x
     * @param   {String}    y
     * @param   {Boolean}   visible
     * @return  {Boolean}   true
     * @public
     */
    self.popup = function popup(name, x, y, visible) {
        if ( ( name in Stored ) === false ) {
            // 無ければ抜ける
            return false;
        }
        const items = [];
        items.push({
            icon:           ICONS.HOME,
            label:          'ホーム',
            click:          _goHome,
        });
        if ( false ) {
        items.push({ type: 'separator' });
        items.push({
            icon:           ICONS.PRINTER,
            label:          '印刷...',
            click:          _print,
        });
        }
        items.push({ type: 'separator' });
        items.push({
            icon:           ICONS.PROPERTY,
            label:          'このウィンドウの設定を開く ...',
            click:          _configure,
        });
        items.push({
            icon:           ICONS.DEBUG,
            label:          'Developer Toolsを開く ...',
            click:          _openDevTools,
            accelerator:    'Shift+CmdOrCtrl+I',
            visible:        visible || false,
        });
        items.push({
            icon:           ICONS.DEBUG,
            label:          'Developer Toolsを開く (外枠) ...',
            click:          _openDevToolsFrame,
            visible:        visible || false,
        });
        items.push({
            icon:           ICONS.CLOSE,
            label:          'このウィンドウを閉じる',
            click:          _hideWindow,
            accelerator:    'CmdOrCtrl+W',
        });
        items.push({
            icon:           ICONS.CLOSE,
            label:          'このウィンドウを閉じてメモリ開放',
            click:          _closeWindow,
            accelerator:    'Shift+CmdOrCtrl+W',
        });
        items.push({ type: 'separator' });
        items.push({
            icon:           ICONS.MENU,
            label:          'メニューウィンドウを開く ...',
            click:          _showMenuWindow,
        });
        items.push({
            icon:           ICONS.ABOUT,
            label:          'このアプリについて ...',
            click:          _showAboutWindow,
        });
        items.push({ type: 'separator' });
        items.push({
            icon:           ICONS.QUIT,
            label:          'アプリケーションを終了する',
            click:          _quitApp,
        });
        const menu  = Electron.Menu.buildFromTemplate(items);
        if ( x > 0 && y > 0 ) {
            menu.popup(Stored[name].window, x, y);
        } else {
            menu.popup(Stored[name].window);
        }
        return true;
    };

    /**
     * 設定する
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _configure = function _configure(menuItem, browserWindow, event) {
        const each = Stored[WindowIds[browserWindow.id]] || { name: '' };
        $IF.get('./libs/ConfigureWindow.js').show(each.name);
        return true;
    };

    /**
     * devtoolsを表示する
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _openDevTools = function _openDevTools(menuItem, browserWindow, event) {
        const each = Stored[WindowIds[browserWindow.id]] || null;
        if ( each === null ) {
            return false;
        }
        Electron.webContents.fromId(each.webview).openDevTools();
        return true;
    };

    /**
     * devtoolsを表示する (外枠)
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _openDevToolsFrame = function _openDevToolsFrame(menuItem, browserWindow, event) {
        browserWindow.webContents.openDevTools();
        return true;
    };

    /**
     * 印刷ダイアログを開く
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _print = function _print(menuItem, browserWindow, event) {
        const each = Stored[WindowIds[browserWindow.id]] || null;
        if ( each === null ) {
            return false;
        }
        Electron.webContents.fromId(each.webview).printToPDF();
        return true;
    };

    /**
     * ホームへ移動する
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @public
     */
    const _goHome = function _goHome(menuItem, browserWindow, event) {
        const each = Stored[WindowIds[browserWindow.id]] || null;
        if ( each === null ) {
            return false;
        }
        Electron.webContents.fromId(each.webview).loadURL(each.home);
        return true;
    };

    /**
     * このウィンドウを閉じる
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _hideWindow = function _hideWindow(menuItem, browserWindow, event) {
        const each = Stored[WindowIds[browserWindow.id]] || null;
        if ( each === null ) {
            return false;
        }
        return self.hide(each.name);
    };

    /**
     * このウィンドウを閉じる
     *
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _closeWindow = function _closeWindow(menuItem, browserWindow, event) {
        const each = Stored[WindowIds[browserWindow.id]] || null;
        if ( each === null ) {
            return false;
        }
        return self.destroy(each.name);
    };

    /**
     * メニューウィンドウを開く
     *
     * @type    {Function}
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _showMenuWindow = function _showMenuWindow(menuItem, browserWindow, event) {
        $IF.get('./libs/MenuWindow.js').show();
        return true;
    };

    /**
     * アバウトウィンドウを開く
     *
     * @type    {Function}
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _showAboutWindow = function _showAboutWindow(menuItem, browserWindow, event) {
        $IF.get('./libs/AboutWindow.js').show();
        return true;
    };

    /**
     * 終了
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _quitApp = function _quitApp(menuItem, browserWindow, event) {
Log.info(__HERE__, Electron.remote);
        $IF.quit();
        return true;
    };

    /**
     * 終了する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.quit = function quit() {
        for ( let name in Stored ) {
            self.destroy(name);
        }
        return true;
    };

    /**
     * ウィンドウのidからアカウント名を取得する
     *
     * @type    {Function}
     * @method
     * @return  {Number}    id
     * @return  {String}    アカウント名
     */
    self.getNameById = function getNameById(id) {
        id = '' + id;
        if ( id in WindowIds ) {
            return WindowIds[id];
        }
        return '';
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();

// let aaaa_ = function(){
//     /**
//      * BrowserWindow クラス
//      *
//      * @type    {BrowserWindow}
//      */
//     const BrowserWindow = require('electron').browserWindow;
//
//     /**
//      * Menu クラス
//      *
//      * @type    {Menu}
//      */
//     const Menu = require('electron').menu;
//
//     /**
//      * NativeImage クラス
//      *
//      * @type    {NativeImage}
//      */
//     const NativeImage = require('electron').nativeImage;
//
//     /**
//      * IPC クラス
//      *
//      * @type    {IPC}
//      */
//     const IPC = require('electron').ipc;
//
//     /**
//      * Registry クラス
//      *
//      * @type    {Registry}
//      */
//     const Registry = require('./Registry');
//
//     /**
//      * Log クラス
//      *
//      * @type    {Log}
//      */
//     const Log = require('./Log');
//
//     /**
//      * EVENT クラス
//      *
//      * @type    {EVENT}
//      */
//     const EVENT = require('./EventNames');
//
//     /**
//      * Hash クラス
//      *
//      * @type    {Hash}
//      */
//     const Hash = require('./Hash');
//
//     /**
//      * Util クラス
//      *
//      * @type    {Util}
//      */
//     const Util = require('./Util');
//
//     /**
//      * Config クラス
//      *
//      * @type    {Config}
//      */
//     const Config = require('./Config');
//
//     /**
//      * MenuWindow クラス
//      *
//      * @type    {MenuWindow}
//      */
//     const MenuWindow = require('./MenuWindow');
//
//     /**
//      * MemoryUsage クラス
//      *
//      * @type    {MemoryUsage}
//      */
//     const MemoryUsage = require('./MemoryUsage');
//
//     /**
//      * MenuWindow クラス
//      *
//      * @type    {MenuWindow}
//      */
//     var MenuBuilder = null;
//
//     /**
//      * アカウントデータ
//      *
//      * @type    {Object}
//      */
//     var accounts         = {};
//
//     /**
//      * ウィンドウのストア
//      *
//      * @type    {Object}
//      */
//     var Stored           = {};
//
// // ★★★★
//     const blank          = 'file://' + Config.relativePath('./blank.html');
//     var iconfile         =             Config.relativePath('./img/icon-ifollow-16.png');
//
//     /**
//      * デバッグモードフラグ
//      *
//      * @type    {Boolean}
//      */
//     var isDebugMode = Config.isDebugMode();
//
//     /**
//      * BrowserWindow インスタンスを取得する(シングルトン)
//      *
//      * @method
//      * @param   {String}        name
//      * @param   {Object}        options
//      * @return  {BrowserWindow} BrowserWindowインスタンス
//      * @public
//      */
//     self.get = function(name, options) {
//         // nameを特定
//         name              = Util.enforceString(name, '-');
//         if ( name === '' || name === '-' ) {
//             throw new Error('Invalid name of account. [' + name + ']');
//         }
//         // ハッシュ値を取得
//         var hash          = Hash.md5(name);
//         var key           = 'hash:' + hash;
//         // アカウント情報を取得
//         var accounts      = _getAccounts(false);
//         var each          = Stored[hash] || null;
//         if ( each === null ) {
//             var conf      = accounts[key];
//             var pos       = _loadPosition(conf);
//             var win       = new BrowserWindow({
//                 width:                  pos.width,
//                 height:                 pos.height,
//                 x:                      pos.x,
//                 y:                      pos.y,
//                 'use-content-size':     false,
//                 center:                 pos.center,
//                 icon:                   conf.icon,
//                 resizable:              true,
//                 show:                   true,
//                 frame:                  true,
//                 'auto-hide-menu-bar':   true,
//                 'web-preferences':      {
//                     'node-integration': true,
//                     defaultFontFamily:  {
//                       standard:         'Meiryo UI',
//                       serif:            'MS PMincho',
//                       sansSerif:        'Meiryo UI',
//                       monospace:        'MS Gothic'
//                     },
//                     defaultEncoding:    'UTF-8',
//                 },
//             });
//             var isMaximized = false;
//             var isMinimized = false;
//             if ( pos.isMaximized === true ) {
//                 isMaximized = true;
//                 win.maximize();
//             } else if ( pos.isMinimized === true && false ) {
//                 isMinimized = true;
//                 win.minimize();
//             } else {
//                 win.restore();
//             }
//             win.on('minimize',    _handleMinimize);
//             win.on('close',       _handleClose);
//             win.on('closed',      _handleClosed);
//             win.on('app-command', _handleAppCommand);
//             win.on('focus',       _handleFocus);
//             _initWebContents(win.webContents, name);
//             var url       = 'file://' + Config.relativePath('./webview.html');
//             win.loadURL(url);
//             MenuBuilder   = MenuBuilder || require('./MenuBuilder');
//             var menu      = Menu.buildFromTemplate([
//                 MenuBuilder.getAppFile(hash),
//                 MenuBuilder.getAppEdit(),
//             ]);
//             MenuBuilder.updateCanGoBack(menu, false, false);
//             win.setMenu(menu);
//             each          = {
//                 name:        name,
//                 hash:        hash,
//                 id:          win.id,
//                 window:      win,
//                 canClose:    false,
//                 menu:        menu,
//                 isMaximized: isMaximized,
//                 isMinimized: isMinimized,
//             };
//             Stored[hash]  = each;
//             _handleFocus({sender:{id:win.id}});
//         }
//         return each.window;
//     };
//
//     /**
//      * アカウント情報を取得
//      *
//      * @method
//      * @param   {Boolean}   nocache     キャッシュを使用しないか否か
//      * @return  {Object}    アカウント情報オブジェクト
//      * @public
//      */
//     var _getAccounts = function(nocache) {
//         var isEmpty = true;
//         for ( var i in accounts ) {
//             isEmpty = false;
//             break;
//         }
//         if ( nocache === true || isEmpty === true ) {
//             // キャッシュを使わないか，アカウント情報がなければ読み込み
//             accounts = Config.getAccounts(true);
//         }
//         return accounts;
//     };
//
//     /**
//      * アカウント情報を取得
//      *
//      * @method
//      * @param   {WebContents}   web
//      * @param   {String}        params
//      * @return  {Object}        アカウント情報オブジェクト
//      * @public
//      */
//     var _initWebContents = function(web, name) {
//         web.on('did-finish-load', function(event){
//             return web.send(EVENT.INITWEB, {name: name});
//         });
//         return true;
//     };
//
//     /**
//      * アプリケーションコマンドイベントハンドラ
//      *
//      * @method
//      * @param   {Event}     event
//      * @return  {Boolean}   true
//      * @public
//      */
//     var _handleAppCommand = function(event, cmd) {
//         switch ( cmd ) {
//             case 'browser-backward':
//                 self.goBack({}, event.sender);
//                 break;
//
//             case 'browser-forward':
//                 self.goForward({}, event.sender);
//                 break;
//
//             default:
//                 break;
//         }
//         return true;
//     };
//
//     /**
//      * フォーカスイベントハンドラ
//      *
//      * @method
//      * @param   {Event}     event
//      * @return  {Boolean}   true
//      * @public
//      */
//     var _handleFocus = function(event) {
//         var each = self.getWindowById(event.sender.id);
//         var focus = {
//             type: 'each',
//             each: each.name,
//         };
//         Registry.set('lastFocusedWindow', focus);
//         return true;
//     };
//
//     /**
//      * ウィンドウを閉じる処理
//      *
//      * @method
//      * @param   {Event} event
//      * @private
//      */
//     var _handleMinimize = function(event) {
//         var each = self.getWindowById(this.id);
//         if ( each !== null ) {
//             _savePosition(each.hash);
//             this.hide();
//         }
//     };
//
//     /**
//      * ウィンドウを閉じる処理
//      *
//      * @method
//      * @param   {Event} event
//      * @private
//      */
//     var _handleClose = function(event) {
//         var each                 = self.getWindowById(this.id);
//         if ( each !== null ) {
//             if ( each.canClose !== true ) {
//                 event.preventDefault();
//                 each.isMaximized = this.isMaximized();
//                 this.minimize();
//             } else {
//                 _savePosition(each.hash);
//             }
//         }
//     };
//
//     /**
//      * ウィンドウを閉じた処理
//      *
//      * @method
//      * @private
//      */
//     var _handleClosed = function(event) {
//         var each        = self.getWindowById(this.id);
//         if ( each !== null ) {
//             // メモリ使用量を解放 → 保存はWebView::_handleInitWebContentsで行う
//             MemoryUsage.clear('each:' + each.name);
//             var hash    = each.hash;
//             for ( var i in each ) {
//                 each[i] = null;
//             }
//             delete Stored[hash];
//         }
//     };
//
//     /**
//      * ウィンドウを開く処理
//      *
//      * @method
//      * @param   {String}    hash
//      * @return  {Boolean}   true
//      * @public
//      */
//     self.open = function(hash) {
//         var each = self.getWindowByHash(hash);
//         if ( each === null ) {
//             return false;
//         }
//         if ( each.isMaximized === true ) {
//             each.window.maximize();
//         }
//         each.window.show();
//         return true;
//     };
//
//     /**
//      * ウィンドウを開く処理
//      *
//      * @method
//      * @param   {String}    name
//      * @return  {Boolean}   true
//      * @public
//      */
//     self.openByName = function(name) {
//         var win  = self.get(name);
//         if ( win === null ) {
//             return false;
//         }
//         var each = self.getWindowByName(name);
//         if ( each.isMaximized === true ) {
//             each.window.maximize();
//         }
//         each.window.show();
//         return true;
//     };
//
//     /**
//      * ウィンドウを開く処理 from メニュー
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @public
//      */
//     self.openFromMenu = function(item, win) {
//         var name = '' + ( item.id || '' );
//         return self.openByName(name);
//     };
//
//     /**
//      * ウィンドウを閉じる処理
//      *
//      * @method
//      * @param   {String}    hash
//      * @return  {Boolean}   true
//      * @public
//      */
//     self.close = function(hash) {
//         var each = self.getWindowByHash(hash);
//         if ( each === null ) {
//             return false;
//         }
//         each.canClose = true;
//         each.window.close();
//         return true;
//     };
//
//     /**
//      * ウィンドウを閉じる処理
//      *
//      * @method
//      * @param   {String}    hash
//      * @return  {Boolean}   true
//      * @public
//      */
//     self.hide = function(hash) {
//         var each = self.getWindowByHash(hash);
//         if ( each === null ) {
//             return false;
//         }
//         each.canClose = false;
//         each.window.close();
//         return true;
//     };
//
//     /**
//      * 終了処理
//      *
//      * @method
//      * @return  {Boolean}   true
//      * @public
//      */
//     self.quit = function() {
//         for ( var hash in Stored ) {
//             self.close(hash);
//         }
//         return true;
//     };
//
//     /**
//      * HASHを指定してウィンドウを取得する
//      *
//      * @method
//      * @param   {String}    hash
//      * @private
//      */
//     self.getWindowByHash = function(hash) {
//         hash = Util.enforceString(hash);
//         if ( ( hash in Stored ) === true ) {
//             return Stored[hash];
//         }
//         return null;
//     };
//
//     /**
//      * IDを指定してウィンドウを取得する
//      *
//      * @method
//      * @param   {Number}    id
//      * @private
//      */
//     self.getWindowById = function(id) {
//         for ( var hash in Stored ) {
//             if ( hash === 'length' ) {
//                 continue;
//             }
//             var each = Stored[hash];
//             if ( each.id === id ) {
//                 return each;
//             }
//         }
//         return null;
//     };
//
//     /**
//      * NAMEを指定してウィンドウを取得する
//      *
//      * @method
//      * @param   {String}    name
//      * @private
//      */
//     self.getWindowByName = function(name) {
//         for ( var hash in Stored ) {
//             if ( hash === 'length' ) {
//                 continue;
//             }
//             var each = Stored[hash];
//             if ( each.name === name ) {
//                 return each;
//             }
//         }
//         return null;
//     };
//
//     /**
//      * ウィンドウ位置を取得する
//      *
//      * @method
//      * @param   {Object}        options
//      * @private
//      */
//     var _loadPosition = function(options) {
// // ★★★★
//         var pos  = Util.extend({}, options.pos);
//         pos      = Util.extend({
//             width:  500,
//             height: 500,
//             x:      null,
//             y:      null,
//             center: true,
//             state:  'normal',
//         }, pos);
//         return pos;
//     };
//
//     /**
//      * ウィンドウ位置を保存する
//      *
//      * @method
//      * @param   {String}    hash
//      * @return  {Boolean}   true
//      * @private
//      */
//     var _savePosition = function(hash) {
//         var accounts         = _getAccounts(true);
//         var key              = 'hash:' + hash;
//         var conf             = accounts[key];
//         var win              = Stored[hash].window;
//         var pos              = win.getBounds();
//         var isMaximized      = win.isMaximized();
//         var isMinimized      = win.isMinimized();
//         if ( isMaximized !== true && pos.width > 20 && pos.height > 20 ) {
//             // 最大化ではなく20px角より大きければ位置を保持
//             conf.pos         = pos;
//         }
//         conf.pos.center      = false;
//         conf.pos.isMaximized = isMaximized;
//         conf.pos.isMinimized = isMinimized;
//         Config.setAccount(key, conf);
//         Config.save();
//         return true;
//     };
//
//     /**
//      * 設定する
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.configure = function(item, win) {
// // ★★★★
//         Util.dump({
//             method:         '_configure',
//             "item.label":   (item||{}).label,
//             "item.id":      (item||{}).id,
//             "win.id":       (win ||{}).id,
//         });
//         return true;
//     };
//
//     /**
//      * devtoolsを表示する
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.openDevTools = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'openDevTools', args);
//         return true;
//     };
//
//     /**
//      * devtoolsを表示する (外枠)
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.openDevToolsFrame = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         win.openDevTools();
//         return true;
//     };
//
//     /**
//      * リロードする
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.reload = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'reload', args);
//         return true;
//     };
//
//     /**
//      * リロードする (外枠)
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.reloadFrame = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         win.reload();
//         return true;
//     };
//
//     /**
//      * 印刷ダイアログを開く
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.print = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'print', args);
//         return true;
//     };
//
//     /**
//      * 戻る進むボタンの有効化/無効化
//      *
//      * @method
//      * @param   {String}    account
//      * @param   {Boolean}   canGoBack
//      * @param   {Boolean}   canGoForward
//      * @return  {Boolean}   true
//      * @public
//      */
//     self.updateCanGoBack = function(account, canGoBack, canGoForward) {
//         var each = self.getWindowByName(account);
//         if ( each === null ) {
//             return false;
//         }
//         var menu         = each.menu;
//         MenuBuilder.updateCanGoBack(menu, canGoBack, canGoForward);
//         return true;
//     };
//
//     /**
//      * 戻る
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @public
//      */
//     self.goBack = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'goBack', args);
//         return true;
//     };
//
//     /**
//      * 進む
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.goForward = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'goForward', args);
//         return true;
//     };
//
//     /**
//      * ホームへ移動する
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @public
//      */
//     self.goHome = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'goHome', args);
//         return true;
//     };
//
//     /**
//      * お気に入りへ移動する
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @public
//      */
//     self.goFavorite = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         var args = Array.prototype.slice.call(arguments);
//         _sendMessage(each.window.webContents, 'goFavorite', args);
//         return true;
//     };
//
//     /**
//      * このウィンドウを閉じる
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.hideWindow = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         return self.hide(each.hash);
//     };
//
//     /**
//      * このウィンドウを閉じる
//      *
//      * @method
//      * @param   {MenuItem}      item
//      * @param   {BrowserWindow} win
//      * @return  {Boolean}       true
//      * @private
//      */
//     self.closeWindow = function(item, win) {
//         var each = self.getWindowById(win.id);
//         if ( each === null ) {
//             return false;
//         }
//         return self.close(each.hash);
//     };
//
//     /**
//      * renderプロセスにIPCメッセージを送る
//      *
//      * @method
//      * @param   {WebContents}   render
//      * @param   {String}        channel
//      * @param   {Array}         args
//      * @return  {Boolean}       true
//      * @private
//      */
//     var _sendMessage = function(render, channel, args) {
//         // IPCイベントパラメータを構成
//         var params = {
//             type:        'event',
//             event:       {
//                 channel: channel,
//                 args:    args,
//             }
//         };
//         return render.send(EVENT.MAIN_MESSAGE, params);
//     };
//
//     // レジストリに登録
//     Registry.set('EachWindow.instance', self, null, true);
//
//     // -------------------------------------------------------------------------
//     return self;
// };
