"use strict";
/**
 * MainController モジュール
 *
 * @module  {MainController}    MainController
 * @class   {MainController}
 */
module.exports = new (function MainController() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

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
        Log.info('Start ' + __PRODUCT__);

        // クラッシュレポート
        // Electron.crashReporter.start();

//         // レジストリを読み込み
//         Registry      = require('./lib/Registry');
//
//         // ロガーの読み込み

//         // ライブラリの読み込み
//         Util          = require('./lib/Util');
//         Config        = require('./lib/Config');
//         Config.setAppPath(HERE);
//         MenuBuilder   = require('./lib/MenuBuilder');
//         MenuWindow    = require('./lib/MenuWindow');
//         EachWindow    = require('./lib/EachWindow');
        return true;
    };

    /**
     * 実行可能になったら実行する処理
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _onReady = function _onReady() {
        try {
            _execute();
        } catch (error) {
            _handleError(error);
        }
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * 処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _execute = function _execute() {
        // メニューウィンドウの生成
        const MenuWindow = $IF.get('./libs/MenuWindow.js');
        MenuWindow.create();
        MenuWindow.show();

//         // ウィンドウの生成
//         var partitions = Config.getArray('partition', []);
//         if ( partitions.length < 1 ) {
//             rootWindow = menuWindow;
//         } else {
//             rootWindow = _getEachWindow(partitions);
//         }
//         // ウィンドウが生成されていなければ終了
//         if ( ! rootWindow ) {
//             Util.error('Error: root window is null.', 'Error');
//             Util.quit(true);
//             return false;
//         }
//         setTimeout(function(){
//             rootWindow.hide();
//             rootWindow.show();
//         }, 1);
//
        // トレイアイコンを取得
        $IF.get('./libs/TrayIcon.js');
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * 終了処理
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    self.quit = function quit() {
Log.info(__HERE__);
        // トレイアイコンがあれば閉じる
        $IF.get('./libs/TrayIcon.js').quit();
//         Registry.get('TrayIcon.instance', {quit:function(){}}).quit();
        // 明示的に終了(ウィンドウを解放)
        $IF.get('./libs/MenuWindow.js').quit();
        $IF.get('./libs/EachWindow.js').quit();
//         // ウィンドウを全部閉じる
//         const allWindows    = Electron.BrowserWindow.getAllWindows();
//         for ( let win of allWindows ){
//             win.destory();
//         }
//         Registry.get('EachWindow.instance', {quit:function(){}}).quit();
        Log.info('End ' + __PRODUCT__);
Log.info(__HERE__);
        App.quit();
Log.info(__STACK__[0].toString(), __STACK__[1].toString(), __STACK__[2].toString());
        return true;
    };

    /**
     * エラーハンドラ
     *
     * @method
     * @param   {Error}     error
     * @return  {Boolean}   true
     * @private
     */
    const _handleError = function _handleError(error) {
        const title   = 'error - ' + __PRODUCT__;
        const message = [
            'Error has occurred in controller execution.',
            '',
            error.stack,
        ].join('\n');
        Log.error(message);
        Dialog.showErrorBox(title, message);
        $IF.quit();
        return false;
    };

    // -------------------------------------------------------------------------
    /**
     * 処理
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    self.execute = function execute() {
        App.on('ready', _onReady);
        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();

// var Controller = function Controller(App){
//
//     /**
//      * カレントディレクトリ
//      *
//      * @type    {String}
//      */
//     const HERE = __dirname;
//
//     /**
//      * Registry クラス
//      *
//      * @type    {Registry}
//      */
//     var Registry = null;
//
//     /**
//      * Log クラス
//      *
//      * @type    {Log}
//      */
//     var Log = null;
//
//     /**
//      * Util クラス
//      *
//      * @type    {Util}
//      */
//     var Util = null;
//
//     /**
//      * Config クラス
//      *
//      * @type    {Config}
//      */
//     var Config = null;
//
//     /**
//      * MenuBuilder クラス
//      *
//      * @type    {MenuBuilder}
//      */
//     var MenuBuilder = null;
//
//     /**
//      * MenuWindow クラス
//      *
//      * @type    {MenuWindow}
//      */
//     var MenuWindow = null;
//
//     /**
//      * EachWindow クラス
//      *
//      * @type    {EachWindow}
//      */
//     var EachWindow = null;
//
//     var rootWindow    = null;
//     var menuWindow    = null;
//     var trayIcon      = null;
//
//     // -------------------------------------------------------------------------
//     /**
//      * 処理
//      *
//      * @method
//      * @return  {Boolean}   true
//      * @private
//      */
//     var _execute = function() {
//         // メニューウィンドウの生成
//         menuWindow     = _getMenuWindow();
//         // ウィンドウの生成
//         var partitions = Config.getArray('partition', []);
//         if ( partitions.length < 1 ) {
//             rootWindow = menuWindow;
//         } else {
//             rootWindow = _getEachWindow(partitions);
//         }
//         // ウィンドウが生成されていなければ終了
//         if ( ! rootWindow ) {
//             Util.error('Error: root window is null.', 'Error');
//             Util.quit(true);
//             return false;
//         }
//         setTimeout(function(){
//             rootWindow.hide();
//             rootWindow.show();
//         }, 1);
//
//         // トレイアイコンを取得
//         trayIcon       = _getTrayIcon();
//         return true;
//     };
//
//     /**
//      * メニューウィンドウを取得
//      *
//      * @method
//      * @return  {MenuWindow}    win
//      * @private
//      */
//     var _getMenuWindow = function() {
//         var win        = MenuWindow.get();
//         return win;
//     };
//
//     /**
//      * 各ウィンドウを取得
//      *
//      * @method
//      * @param   {Array}         partitions
//      * @return  {EachWindow}    win
//      * @private
//      */
//     var _getEachWindow = function(partitions) {
//         return null;
//     };
//
//     /**
//      * トレイアイコンをセット
//      *
//      * @method
//      * @return  {TrayIcon}  icon
//      * @private
//      */
//     var _getTrayIcon = function() {
//         var TrayIcon = require('./lib/TrayIcon');
//         var icon     = TrayIcon.get();
//         return icon;
//     };
//
//     // -------------------------------------------------------------------------
//     /**
//      * 初期化
//      *
//      * @method
//      * @return  {Boolean}   true
//      * @private
//      */
//     var _init = function() {
//         // プロセスの終了の指定
//         App.on('window-all-closed', function() {
//             Log.info('End ' + App.getName() + '/' + App.getVersion());
//             if ( process.platform != 'darwin' ) {
//                 App.quit();
//             }
//         });
//
//         // クラッシュレポート
//         // require('electron').crashReporter.start();
//
//         // レジストリを読み込み
//         Registry      = require('./lib/Registry');
//
//         // ロガーの読み込み
//         Log           = require('./lib/Log');
//         Log.info('Start ' + App.getName() + '/' + App.getVersion());
//
//         // ライブラリの読み込み
//         Util          = require('./lib/Util');
//         Config        = require('./lib/Config');
//         Config.setAppPath(HERE);
//         MenuBuilder   = require('./lib/MenuBuilder');
//         MenuWindow    = require('./lib/MenuWindow');
//         EachWindow    = require('./lib/EachWindow');
//
//         return true;
//     };
//
//     /**
//      * 終了処理
//      *
//      * @method
//      * @param   {Error}     error
//      * @return  {Boolean}   true
//      * @private
//      */
//     var _handleError = function(error) {
//         var title   = 'error - ' + App.getName() + '/' + App.getVersion();
//         var message = [
//             'Error has occurred in controller execution.',
//             '',
//             error.stack,
//         ].join('\n');
//         require('electron').dialog.showErrorBox(title, message);
//         _quit();
//         if ( process.platform != 'darwin' ) {
//             App.quit();
//         }
//         return false;
//     };
//
//     /**
//      * 終了処理
//      *
//      * @method
//      * @return  {Boolean}   true
//      * @private
//      */
//     var _quit = function() {
//         // トレイアイコンがあれば閉じる
//         Registry.get('TrayIcon.instance', {quit:function(){}}).quit();
//         // ウィンドウを全部閉じる
//         var BrowserWindow  = require('electron').browserWindow;
//         var allWindows     = BrowserWindow.getAllWindows();
//         for ( var i=0 ; i<allWindows.length ; i++ ){
//             allWindows[i].close();
//         }
//         // 明示的に終了(ウィンドウを解放)
//         Registry.get('MenuWindow.instance', {quit:function(){}}).quit();
//         Registry.get('EachWindow.instance', {quit:function(){}}).quit();
//         return true;
//     };
//     // -------------------------------------------------------------------------
//
//     // -------------------------------------------------------------------------
//     // アプリケーションの準備ができたら処理実行
//     App.on('ready', function(){
//         try {
//             _init();
//             _execute();
//         } catch (error) {
//             _handleError(error);
//         }
//     });
//     // -------------------------------------------------------------------------
//     return self;
// };
// // new Controller(require('electron').app);
// // -----------------------------------------------------------------------------
//
