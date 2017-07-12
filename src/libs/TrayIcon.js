"use strict";
/**
 * TrayIcon モジュール
 *
 * @module  {TrayIcon}  TrayIcon
 * @class   {TrayIcon}
 */
module.exports = new (function TrayIcon() {
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
     * トレイ
     *
     * @type    {Tray}
     */
    let instance = null;

    /**
     * インターバルタイマー識別子
     *
     * @type    {Number}
     */
    let idInterval = 0;

    /**
     * ウィンドウ名
     *
     * @type    {String}
     */
    let windowName = '';

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
        instance      = new Electron.Tray(ICONS.APP);
        instance.setToolTip('This is my application. @todo ★');
//         menu     = menu.concat(_getMenuWindows());
        const submenu = [];
        const menu    = [];
        menu.push({
            icon:           ICONS.APP,
            label:          __PRODUCT__,
            enabled:        false,
        });
        // ウィンドウ
        menu.push({ type: 'separator' });
        const data   = Config.getAccounts(true);
        let i        = 0;
        let each     = null;
        let over     = false;
        for ( let key in data ) {
            if ( data[key].valid !== true ) {
                // リストアップしない
                continue;
            }
            each     = {
                id:             key,
                icon:           __DATA__ + SEP + data[key].icon,
                label:          data[key].name,
                sublabel:       data[key].svcname,
                click:          _showEachWindow,
            };
            if ( ++i > 5 ) {
                over = true;
                submenu.push(each);
            } else {
                menu.push(each);
            }
        }
        if ( over === true ) {
            submenu.push({ type: 'separator' });
            submenu.push({
                icon:           ICONS.DEV,
                label:          'アカウントを追加する ...',
                click:          function(menuItem, browserWindow, event){ alert(menuItem.label); },
            });
            menu.push({
                type:           'submenu',
                label:          'その他のアカウント',
                submenu:        submenu,
            });
        }
        // 共通メニュー
        menu.push({ type: 'separator' });
        menu.push({
            icon:           ICONS.MENU,
            label:          'メニューウィンドウを開く ...',
            click:          _showMenuWindow,
        });
        menu.push({
            icon:           ICONS.ABOUT,
            label:          'このアプリについて ...',
            click:          _showAboutWindow,
        });
        menu.push({ type: 'separator' });
        menu.push({
            icon:           ICONS.QUIT,
            label:          'アプリケーションを終了する',
            click:          _quitApp,
            accelerator:    'Shift+CmdOrCtrl+Q',
        });
        instance.setContextMenu(Electron.Menu.buildFromTemplate(menu));
        // Electron.globalShortcut.register('Shift+CmdOrCtrl+Q', _quitApp);
        instance.on('click',        _showWindows);
        instance.on('double-click', _showWindows);
//             MemoryUsage.init('main');
//             idInterval = setInterval(_updateToolTip, TOOLTIP_INTERVAL);
//             _updateToolTip();
//         var isDevToolsOpened = Config.isDevToolsOpened();
//         if ( isDevToolsOpened === true ) {
//             instance.setImage(icons.dev);
//         } else {
//             instance.setImage(icons.app);
//         }

        return true;
    };

    /**
     * ウィンドウを開く
     *
     * @type    {Function}
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _showWindows = function _showWindows(menuItem, browserWindow, event) {
        if ( windowName === '' ) {
            $IF.get('./libs/MenuWindow.js').show();
        } else {
            $IF.get('./libs/EachWindow.js').show(windowName);
        }
        return true;
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
     * ウィンドウを開く
     *
     * @type    {Function}
     * @method
     * @param   {MenuItem}          menuItem
     * @param   {BrowserWindow}     browserWindow
     * @param   {EventEmitter}      event
     * @return  {Boolean}           true
     * @private
     */
    const _showEachWindow = function _showEachWindow(menuItem, browserWindow, event) {
        const data   = Config.getAccounts();
        $IF.get('./libs/EachWindow.js').create(menuItem.id);
        $IF.get('./libs/EachWindow.js').show(menuItem.id);
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
     * 終了処理
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    self.quit = function quit() {
Log.info(__HERE__);
        instance && instance.destroy && instance.destroy();
        idInterval > 0 && clearInterval(idInterval);
        instance = null;
Log.info(__HERE__);
        Electron.globalShortcut.unregisterAll();
        return true;
    };

    /**
     * ウィンドウ名を保持する
     *
     * @method
     * @param   {String}    name
     * @return  {Boolean}   true
     * @public
     */
    self.setWindowName = function setWindowName(name) {
        windowName = '' + name;
        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
