"use strict";
/**
 * AboutWindow モジュール
 *
 * @module  {AboutWindow}   AboutWindow
 * @class   {AboutWindow}
 */
module.exports = new (function AboutWindow() {
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
     * @return  {Boolean}   true
     */
    self.create = function create(){
        if ( Window !== null ) {
            // あれば終わり
            return true;
        }
        Log.info('Create about window [pid=' + process.pid + ']');

        Window    = new Electron.BrowserWindow({
            width:                  500,
            height:                 400,
            'use-content-size':     false,
            center:                 true,
            icon:                   ICONS.APP,
            resizable:              false,
            minimizable:            false,
            maximizable:            false,
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
            title:                  __PRODUCT_NAME__,
            // titleBarStyle:          'hidden',
        });
        Window.on('close', _handleClose);
        Window.loadURL(Path.resolve(__BASE__ + '/about.html'));
        Window.setMenu(null);
//         if ( isDevToolsOpened === true ) {
//             Window.openDevTools();
//         }
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
            // 無ければ生成
            self.create();
        }
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

    /**
     * ウィンドウを閉じる処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleClose = function _handleClose(event) {
        return self.quit();
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
