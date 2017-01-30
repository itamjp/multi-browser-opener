"use strict";
/**
 * MenuWindow モジュール
 *
 * @module  {MenuWindow}    MenuWindow
 * @class   {MenuWindow}
 */
module.exports = new (function MenuWindow() {
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
     * @type    {BrowserWindow}
     */
    let Window = null;

    /**
     * 閉じることができるか否か
     *
     * @type    {Boolean}
     */
    let canClose = false;

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
     * メニューウィンドウを最小化する処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleMinimize = function _handleMinimize(event) {
        _savePosition();
        return true;
    };

    /**
     * メニューウィンドウを閉じる処理(hide)
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleClose = function _handleClose(event) {
        _savePosition();
        if ( canClose !== true ) {
            event.preventDefault();
            Window.minimize();
            Window.hide();
        } else {
            Log.info('Close menu window [pid=' + process.pid + ']');
        }
        return true;
    };

    /**
     * トレイアイコンに最後のフォーカスのウィンドウを保持させる
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleFocus = function _handleFocus(event) {
        $IF.get('./libs/TrayIcon.js').setWindowName('');
        return true;
    };

    /**
     * ウィンドウ位置を取得する
     *
     * @method
     * @param   {Object}        options
     * @private
     */
    const _loadPosition = function _loadPosition() {
        let pos  = Config.getMenu().pos || {};
        pos      = Object.assign({
            x:      null,
            y:      null,
            width:  500,
            height: 500,
            center: true,
        }, pos);
        return pos;
    };

    /**
     * ウィンドウ位置を保存する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _savePosition = function _savePosition() {
        if ( Window === null ) {
            return true;
        }
        const conf      = Config.getMenu();
        conf.pos        = Window.getBounds();
        conf.pos.width  = 500;
        conf.pos.height = 500;
        conf.pos.center = false;
        Config.setMenu(conf);
        Config.save();
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * ウィンドウを生成する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.create = function create() {
        if ( Window !== null ) {
            // あれば終わり
            return true;
        }
        Log.info('Create menu window [pid=' + process.pid + ']');

        let pos   = _loadPosition();
        Window    = new Electron.BrowserWindow({
            width:                  pos.width,
            height:                 pos.height,
            x:                      pos.x,
            y:                      pos.y,
            'use-content-size':     false,
            center:                 pos.center,
            icon:                   ICONS.APP,
            resizable:              false,
            show:                   true,
            frame:                  true,
            'web-preferences':      {
                'node-integration': true,
                defaultFontFamily:  {
                  standard:         'Meiryo UI',
                  serif:            'MS PMincho',
                  sansSerif:        'Meiryo UI',
                  monospace:        'MS Gothic'
                }
            },
        });
        Window.on('minimize', _handleClose);
        Window.on('close',    _handleClose);
        Window.on('focus',    _handleFocus);
        Window.loadURL(Path.resolve(__BASE__ + '/menu.html'));
        Window.setMenu(null);
        canClose  = false;
//             if ( isDevToolsOpened === true ) {
                Window.openDevTools();
//             }
        return true;
    };

    /**
     * ウィンドウを表示する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.show = function show() {
        if ( Window === null ) {
            // 無ければ抜ける
            return false;
        }
        Window.show();
        Window.restore();
        return true;
    };

    /**
     * ウィンドウを閉じる(開放する)
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.quit = function quit() {
        if ( Window === null ) {
            // 無ければ抜ける
            return false;
        }
        canClose = true;
        Window.close();
        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();

let aaaa_ = function(){
    /**
     * BrowserWindow クラス
     *
     * @type    {BrowserWindow}
     */
    const BrowserWindow = require('electron').browserWindow;

    /**
     * Registry クラス
     *
     * @type    {Registry}
     */
    const Registry = require('./Registry');

    /**
     * Util クラス
     *
     * @type    {Util}
     */
    const Util = require('./Util');

    /**
     * Config クラス
     *
     * @type    {Config}
     */
    const Config = require('./Config');

    /**
     * Log クラス
     *
     * @type    {Log}
     */
    const Log = require('./Log');

    var Window           = null;
    var menupage         = 'file://' + Config.relativePath('./menu.html');
    var blank            = 'file://' + Config.relativePath('./blank.html');
    var iconfile         =             Config.relativePath('./img/icon-ifollow-16.png');
    var canClose         = false;
    var isDevToolsOpened = Config.isDevToolsOpened();

    /**
     * BrowserWindow インスタンスを取得する(シングルトン)
     *
     * @method
     * @param   {Object}        options
     * @return  {BrowserWindow} BrowserWindowインスタンス
     * @public
     */
    self.get = function(options) {
        if ( Window === null ) {
            var pos   = _loadPosition(options);
            Window    = new BrowserWindow({
                width:                  pos.width,
                height:                 pos.height,
                x:                      pos.x,
                y:                      pos.y,
                'use-content-size':     false,
                center:                 pos.center,
                icon:                   iconfile,
                resizable:              false,
                show:                   false,
                frame:                  true,
                'web-preferences':      {
                    'node-integration': true,
                    defaultFontFamily:  {
                      standard:         'Meiryo UI',
                      serif:            'MS PMincho',
                      sansSerif:        'Meiryo UI',
                      monospace:        'MS Gothic'
                    }
                },
            });
            Window.on('minimize', _handleClose);
            Window.on('close',    _handleClose);
            Window.on('closed',   _handleClosed);
            Window.on('focus',    _handleFocus);
            var url  = (options || {}).url || menupage || blank;
            Window.loadURL(url);
            Window.setMenu(null);
            canClose = false;
            if ( isDevToolsOpened === true ) {
                Window.openDevTools();
            }
            _handleFocus({sender:{id:Window.id}});
        }
        return Window;
    };

    /**
     * フォーカスイベントハンドラ
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @public
     */
    var _handleFocus = function(event) {
        var focus = {
            type: 'menu',
        };
        Registry.set('lastFocusedWindow', focus);
        return true;
    };

    /**
     * メニューウィンドウを閉じる処理
     *
     * @method
     * @param   {Event} event
     * @private
     */
    var _handleClose = function(event) {
        _savePosition();
        if ( canClose !== true ) {
            event.preventDefault();
            this.minimize();
            this.hide();
        }
    };

    /**
     * メニューウィンドウを閉じた処理
     *
     * @method
     * @private
     */
    var _handleClosed = function() {
        Window = null;
    };

    /**
     * メニューウィンドウを開く処理
     *
     * @method
     * @public
     */
    self.open = function() {
        Window.show();
        return true;
    };

    /**
     * メニューウィンドウを閉じる処理
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    self.close = function() {
        canClose = true;
        Window.close();
        return true;
    };

    /**
     * 終了処理
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    self.quit = function() {
        return self.close();
    };

    /**
     * ウィンドウ位置を取得する
     *
     * @method
     * @param   {Object}        options
     * @private
     */
    var _loadPosition = function(options) {
        var conf = Config.getMenu();
        var pos  = conf.pos || {};
        pos      = Util.extend(pos, options);
        pos      = Util.extend({
            width:  500,
            height: 500,
            x:      null,
            y:      null,
            center: true,
        }, pos);
        return pos;
    };

    /**
     * ウィンドウ位置を保存する
     *
     * @method
     * @private
     */
    var _savePosition = function() {
        var conf        = Config.getMenu();
        conf.pos        = Window.getBounds();
        conf.pos.width  = 500;
        conf.pos.height = 500;
        conf.pos.center = false;
        Config.setMenu(conf);
        Config.save();
        return true;
    };

    // レジストリに登録
    Registry.set('MenuWindow.instance', self, null, true);
    // -------------------------------------------------------------------------
    return self;
};
// module.exports = new MenuWindow();
