"use strict";
/**
 * ConfigureWindow モジュール
 *
 * @module  {ConfigureWindow}   ConfigureWindow
 * @class   {ConfigureWindow}
 */
module.exports = new (function ConfigureWindow() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * ウィンドウ
     *
     * @type    {BrowserWindow}
     */
    let Window = null;

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

    // -------------------------------------------------------------------------
    /**
     * ウィンドウを生成する
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     */
    self.create = function create(name){
        if ( Window === null ) {
            // なければ生成
            Log.info('Create configure window [pid=' + process.pid + '] with [name=' + name + ']');
            Window    = new Electron.BrowserWindow({
                width:                  800,
                height:                 600,
                'use-content-size':     false,
                center:                 true,
                icon:                   ICONS.APP,
                resizable:              true,
                minWidth:               800,
                minHeight:              600,
                minimizable:            false,
                maximizable:            true,
                fullscreenable:         false,
                show:                   true,
                frame:                  true,
                'web-preferences':      {
                    'node-integration': true,
                    defaultFontFamily:  {
                      standard:         'Meiryo UI',
                      serif:            'MS PMincho',
                      sansSerif:        'Meiryo UI',
                      monospace:        'MS Gothic'
                    },
                    defaultEncoding:    'UTF-8',
                },
                alwaysOnTop:            false,
                skipTaskbar:            false,
                title:                  '設定 - '+ __PRODUCT_NAME__,
                // titleBarStyle:          'hidden',
            });
            Window.on('close', self.close);
            Window.setMenu(null);
            Window.loadURL(Path.resolve(__BASE__ + '/configure.html') + '?' + encodeURIComponent(name||''));
        }
//         if ( isDevToolsOpened === true ) {
            Window.openDevTools();
//         }
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
        self.create(name||'');
        Window.show();
        return true;
    };

    /**
     * ウィンドウを閉じる
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.close = function close() {
        return self.quit();
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
        Window.destroy();
        Window = null;
        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
