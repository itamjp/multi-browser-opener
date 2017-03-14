"use strict";
/**
 * WebView モジュール
 *
 *  renderプロセスで実行される
 *  jQuery使用可
 *
 * @module  {WebView}   WebView
 * @class   {WebView}
 */
module.exports = new (function WebView() {
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
    const Config = $IF.getMain('./libs/Config.js');

    /**
     * EachWindow
     *
     * @type    {EachWindow}
     */
    const EachWindow = $IF.getMain('./libs/EachWindow.js');

    /**
     * jQuey
     *
     * @type    {Function}
     */
    let $ = global.jQuery || global.$ ;

    /**
     * window
     *
     * @type    {Window}
     */
    let window = global.window;

    /**
     * document
     *
     * @type    {Document}
     */
    let document = global.document;

    /**
     * location
     *
     * @type    {Location}
     */
    let location = global.location;

    /**
     * アカウント情報
     *
     * @type    {Object}
     */
    let account = {};

    /**
     * webview
     *
     * @type    {HTMLElement}
     */
    let webview = null;

    /**
     * HTMLエレメント
     *
     * @type    {Object}
     */
    const ELEMENTS = {
        holder:         null,
        loading:        null,
        favicon:        null,
        heart:          null,
        search:         null,
        url:            null,
        goBack:         null,
        goForward:      null,
        reload:         null,
        popupMenu:      null,
        customStyle:    null,
    };

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
     * 読み込み開始イベントの処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleStartLoadingEvent = function _handleStartLoadingEvent(event) {
        $(ELEMENTS.loading).css('display', 'inline-block');
        return true;
    };

    /**
     * 読み込み終了イベントの処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleStopLoadingEvent = function _handleStopLoadingEvent(event) {
        $(ELEMENTS.loading).css('display', 'none');
        _updateStatus();
        return true;
    };

    /**
     * 読み込み完了イベントの処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleFinishLoadEvent = function _handleFinishLoadEvent(event) {
        _updateStatus();
/*
        var checkurl         = url.replace(/#.*$/g, '');
        if ( favorites.indexOf(checkurl) > -1 ) {
            elements.heart.style.color = '#c81808';
        } else {
            elements.heart.style.color = '#ffffff';
        }
        var style            = ((elements.customStyle||{}).textContent||'').replace(/\n+\s*|^\s+|\s+$/g, '');
        if ( style !== '' ) {
            webview.instance.insertCSS(style);
        }
*/
        let style = '' + (account.style || '').replace(/\n+\s*|^\s+|\s+$/g, '');
        if ( style !== '' ) {
            webview.insertCSS(style);
        }
        EachWindow.setWebviewId(account.name, webview.getWebContents().id);
//         _requestUpdateWebViewPid();
        Log.info('Open url:', webview.getURL());
        return true;
    };

    /**
     * ページタイトルを更新するイベントの処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handlePageTitleUpdatedEvent = function _handlePageTitleUpdatedEvent(event) {
        _updateStatus();
        return true;
    };

    /**
     * ページfaviconを更新するイベントの処理
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handlePageFaviconUpdatedEvent = function _handlePageFaviconUpdatedEvent(event) {
        const evt     = event.originalEvent || event || {};
        const favicon = (evt.favicons || []).shift() || '';
        // faviconがあるか？
        if ( favicon === '' ) {
            return true;
        }
        $(ELEMENTS.favicon).attr('src', favicon);
        return true;
    };

    /**
     * 新規ウィンドウを開くイベント
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _handleNewWindowEvent = function _handleNewWindowEvent(event) {
        const evt       = event.originalEvent || event || {};
        evt.preventDefault();
        const frameName = evt.frameName || '_blank';
        const url       = evt.url       || 'about:blank';
        Log.info('Open new window:', url);
        Electron.shell.openExternal(url);
        return true;
    };

    /**
     * 戻る
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _goBack = function _goBack(event) {
        if ( webview.canGoBack() === true ) {
            webview.goBack();
        }
        return true;
    };

    /**
     * 進む
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _goForward = function _goForward(event) {
        if ( webview.canGoForward() === true ) {
            webview.goForward();
        }
        return true;
    };

    /**
     * リロード
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _reload = function _reload(event) {
        webview.reload();
        return true;
    };

    /**
     * 戻る進むボタンの有効化/無効化
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    const _updateStatus = function _updateStatus() {
        // ボタン状態更新
        const canGoBack                 = webview.canGoBack();
        const canGoForward              = webview.canGoForward();
        if ( ELEMENTS.goBack !== null ) {
            ELEMENTS.goBack.disabled    = ! canGoBack;
        }
        if ( ELEMENTS.goForward !== null ) {
            ELEMENTS.goForward.disabled = ! canGoForward;
        }
//         return EachWindow.updateCanGoBack(account.name, canGoBack, canGoForward);

        // タイトル更新
        EachWindow.setTitle(account.name, (account.titleprefix || '') + webview.getTitle() + (account.titlesuffix || ''));

        // URL表示更新
        const url                       = webview.getURL();
        $(ELEMENTS.url).val(url);
        return true;
    };

    /**
     * ポップアップメニューを表示する
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @private
     */
    const _popupMenu = function _popupMenu(event){
        const rect = event.target.getBoundingClientRect();
        EachWindow.popup(account.name, rect.left, rect.top + rect.height + 2, event.ctrlKey||false);
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * ウィンドウ名を保持する
     *
     * @method
     * @param   {Object}    options
     * @return  {Boolean}   true
     * @public
     */
    self.setup = function setup(options) {
        options      = options||{};
        $            = options.jQuery   || $ ;
        window       = options.window   || window;
        document     = options.document || document;
        location     = options.location || location;

        const winid  = options.winid    || -1;
        const holder = options.holder   ||  '#holder';
        const name   = EachWindow.getNameById(winid);
        account      = Config.getAccountInfo(name);

        // bodyにセットしておく
        $('body').attr('data-window-id',    winid);
        $('body').attr('data-account-name', name);

        // 要素を保持してイベントを追加する
        for ( let id in ELEMENTS ) {
            ELEMENTS[id] = ($('#' + id)[0]) || null;
        }
        const ClickHandlers = {
            goBack:     _goBack,
            goForward:  _goForward,
            reload:     _reload,
            popupMenu:  _popupMenu,
//             favicon:    _focusUrl,
//             heart:      handlers.toggleFavorites,
        };
        for ( let id in ClickHandlers ) {
            if ( ( id in ELEMENTS ) === true ) {
                $(ELEMENTS[id]).on('click', ClickHandlers[id]);
            }
        }
//         // url要素のイベントの追加
//         var elementevents = {
//             focus:      _handleUrlFocus,
//             blur:       _handleUrlBlur,
//             keypress:   _handleUrlKeypress,
//         };
//         if ( ( 'url' in elements ) === true ) {
//             for ( var i in elementevents ) {
//                 elements.url.addEventListener(i, elementevents[i]);
//             }
//         }
//         // favicon要素イベントの追加の
//         if ( ( 'favicon' in elements ) === true ) {
//             elements.favicon.addEventListener('load', _handleFaviconLoad);
//         }

        // webviewを生成
        const webviewTag = [
            '<webview',
                'id="webview"',
                'src="./loading.html"',
                'autosize="on"',
                'nodeintegration="off"',
                'plugins="off"',
                'partition="persist:' + account.partition + '"',
                'webpreferences="javascript=on,webSecurity=off,defaultEncoding=UTF-8"',
            '></webview>',
        ].join(' ');
        $(ELEMENTS.holder).html(webviewTag);

        // webviewを保持
        webview = $('#webview')[0];
        // イベントをセット
        $(webview).on('did-start-loading',        _handleStartLoadingEvent);
        $(webview).on('did-stop-loading',         _handleStopLoadingEvent);
        $(webview).on('did-finish-load',          _handleFinishLoadEvent);
        // webview.addEventListener('did-get-response-details', _handleGetResponseDetailsEvent);
        $(webview).on('page-title-updated',       _handlePageTitleUpdatedEvent);
        $(webview).on('page-favicon-updated',     _handlePageFaviconUpdatedEvent);
        $(webview).on('new-window',               _handleNewWindowEvent);

        // URLをセット
        $(webview).attr('src', account.svcurl);


/*
            const winid   = location.search.substr(1);
            $('body').attr('data-window-id', winid);
            const name    = $IF.getMain('./libs/EachWindow.js').getNameById(winid);
            $('body').attr('data-account-name', name);
            // アカウント情報はグローバルスコープに保持することにする
            Object.defineProperty(global, 'data', {
                value:          $IF.getMain('./libs/Config.js').getAccountInfo(name),
                writable:       false,  // 代入不可
                enumerable:     true,
                configurable:   true,
            });
            // webviewを生成
            $('#holder').html(`
<webview
    id="webview"
    src="./loading.html"
    autosize="on"
    nodeintegration="off"
    plugins="off"
    partition="persist:${data.partition}"
    webpreferences="javascript=on, webSecurity=off, defaultEncoding=UTF-8"
></webview>
`);
            // webviewを生成して読み込み
            const webview = $('#webview');
            webview.attr('src', data.svcurl);

// webview.addEventListener('did-start-loading',        _handleStartLoadingEvent);
// webview.addEventListener('did-stop-loading',         _handleStopLoadingEvent);
    webview.addEventListener('did-finish-load',          _handleFinishLoadEvent);
        webview.addEventListener('did-get-response-details', _handleGetResponseDetailsEvent);
        webview.addEventListener('new-window',               _handleNewWindowEvent);
        webview.addEventListener('page-title-set',           _handlePageTitleSetEvent);
        webview.addEventListener('page-favicon-updated',     _handlePageFaviconUpdatedEvent);
*/

        return true;
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();

const ZZZ = function ZZZ() {
    /**
     * IPC クラス
     *
     * @type    {IPC}
     */
    const IPC = require('electron').ipc;

    /**
     * Remote クラス
     *
     * @type    {Remote}
     */
    const Remote = require('electron').remote;

    /**
     * App クラス
     *
     * @type    {App}
     */
    const App = Remote.require('electron').app;

    /**
     * Shell クラス
     *
     * @type    {Shell}
     */
    const Shell = Remote.require('shell');

    /**
     * Registry クラス
     *
     * @type    {Registry}
     */
    const Registry = Remote.require('./lib/Registry');

    /**
     * Util クラス
     *
     * @type    {Util}
     */
    const Util = Remote.require('./lib/Util');

    /**
     * Config クラス
     *
     * @type    {Config}
     */
    const Config = Remote.require('./lib/Config');

    /**
     * File クラス
     *
     * @type    {File}
     */
    const File = Remote.require('./lib/File');

    /**
     * EVENT クラス
     *
     * @type    {EVENT}
     */
    const EVENT = Remote.require('./lib/EventNames');

    /**
     * HTTPSTATUS クラス
     *
     * @type    {HTTPSTATUS}
     */
    const HTTPSTATUS = Remote.require('./lib/HttpStatus');

    /**
     * EachWindow クラス
     *
     * @type    {EachWindow}
     */
    const EachWindow = Remote.require('./lib/EachWindow');

    /**
     * Popup クラス
     *
     * @type    {Popup}
     */
    const Popup = Remote.require('./lib/Popup');

    /**
     * Log クラス (renderプロセスで実行)
     *
     * @type    {Log}
     */
    const Log = require('./Log');

    /**
     * MemoryUsage クラス (renderプロセスで実行)
     *
     * @type    {MemoryUsage}
     */
    const MemoryUsage = require('./MemoryUsage');

    /**
     * window オブジェクト
     *
     * @type    {Object}
     */
    var window = null;

    /**
     * document オブジェクト
     *
     * @type    {Object}
     */
    var document = null;

    /**
     * webview HTMLエレメント
     *
     * @type    {Object}
     */
    var webview = {
        id:         '',
        instance:   null,
        process:    0,
    };

    /**
     * HTMLエレメント
     *
     * @type    {Object}
     */
    var elements = {
        holder:         null,
        loading:        null,
        favicon:        null,
        heart:          null,
        search:         null,
        url:            null,
        goBack:         null,
        goForward:      null,
        reload:         null,
        popupMenu:      null,
        customStyle:    null,
    };

    /**
     * アカウント情報
     *
     * @type    {Object}
     */
    var account = {};

    /**
     * イベントハンドラ
     *
     * @type    {Object}
     */
    var handlers = {};

    /**
     * デバッグモードフラグ
     *
     * @type    {Boolean}
     */
    var isDebugMode = Config.isDebugMode();

    /**
     * お気に入り
     *
     * @type    {Array}
     */
    var favorites = [];

    /**
     * faviconのURL
     *
     * @type    {String}
     */
    var favicon = '';

    /**
     * webviewを初期化する
     *
     * @method
     * @param   {Object}    params
     * @return  {Boolean}   true
     * @public
     */
    self.init = function(params) {
        window          = params.window;
        document        = params.document;
        for ( var i in elements ) {
            elements[i] = document.getElementById(i) || null;
        }
//         elements.holder = document.getElementById(params.holder);
        // main to render通信
        IPC.on(EVENT.INITWEB,      _handleInitWebContents);
        IPC.on(EVENT.MAIN_MESSAGE, _handleMainMessage);

        // イベントの追加
        var elementevents = {
            goBack:     handlers.goBack,
            goForward:  handlers.goForward,
            reload:     handlers.reload,
            popupMenu:  _popupMenu,
            favicon:    _focusUrl,
            heart:      handlers.toggleFavorites,
        };
        for ( var i in elementevents ) {
            if ( ( i in elements ) === true && ( i in elementevents ) === true ) {
                elements[i].addEventListener('click', elementevents[i]);
            }
        }
        // url要素のイベントの追加
        var elementevents = {
            focus:      _handleUrlFocus,
            blur:       _handleUrlBlur,
            keypress:   _handleUrlKeypress,
        };
        if ( ( 'url' in elements ) === true ) {
            for ( var i in elementevents ) {
                elements.url.addEventListener(i, elementevents[i]);
            }
        }
        // favicon要素イベントの追加の
        if ( ( 'favicon' in elements ) === true ) {
            elements.favicon.addEventListener('load', _handleFaviconLoad);
        }
        return true;
    };

    /**
     * url要素にfocusする
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    var _focusUrl = function(){
        elements.url.focus();
        return true;
    };

    /**
     * url focusイベントハンドラ
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @public
     */
    var _handleUrlFocus = function(event){
        elements.search.style.display = 'inline-block';
        setTimeout(function(){elements.url.select();}, 1);
        return true;
    };

    /**
     * url blurイベントハンドラ
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @public
     */
    var _handleUrlBlur = function(event){
        elements.search.style.display = 'none';
        return true;
    };

    /**
     * url keydownイベントハンドラ
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @public
     */
    var _handleUrlKeypress = function(event){
        if ( event.keyCode === 13 ) {
            event.preventDefault();
            elements.url.blur();
            _load(elements.url.value);
            elements.favicon.src = elements.loading.src;
        }
        return true;
    };

    /**
     * ポップアップメニューを表示する
     *
     * @method
     * @param   {Event}     event
     * @return  {Boolean}   true
     * @public
     */
    var _popupMenu = function(event){
        var rect = event.srcElement.getBoundingClientRect();
        return Popup.menu(account.name, rect.left, rect.top + rect.height + 2);
    };

    /**
     * 読み込み(初回)
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    var _loadFirst = function() {
        return _load(account.svcurl);
    };

    /**
     * 読み込み
     *
     * @method
     * @param   {String}    url
     * @return  {Boolean}   true
     * @private
     */
    var _load = function(url) {
        webview.instance.src = url;
        elements.url.value   = url;
        return true;
    };

    /**
     * 読み込み開始イベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleStartLoadingEvent = function(event) {
        _startLoading();
        return true;
    };

    /**
     * 読み込み開始イベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleStopLoadingEvent = function(event) {
        _stopLoading();
        return true;
    };

    /**
     * 読み込み完了イベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleFinishLoadEvent = function(event) {
        var url              = webview.instance.getUrl();
        elements.url.value   = url;
        var checkurl         = url.replace(/#.*$/g, '');
        if ( favorites.indexOf(checkurl) > -1 ) {
            elements.heart.style.color = '#c81808';
        } else {
            elements.heart.style.color = '#ffffff';
        }
        var style            = ((elements.customStyle||{}).textContent||'').replace(/\n+\s*|^\s+|\s+$/g, '');
        if ( style !== '' ) {
            webview.instance.insertCSS(style);
        }
        style                = '' + (account.style || '').replace(/\n+\s*|^\s+|\s+$/g, '');
        if ( style !== '' ) {
            webview.instance.insertCSS(style);
        }
        _updateCanGoBack();
        _requestUpdateWebViewPid();
        Log.dump('Open url: ', url, 'info');
        return true;
    };

    /**
     * 読み込んだ詳細を取得するイベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleGetResponseDetailsEvent = function(event) {
        if ( isDebugMode !== true || true ) {
            return true;
        }
        var newUrl           = event.newUrl           || 'empty url';
        var originalUrl      = event.originalUrl      || 'empty url';
        var requestMethod    = event.requestMethod    || 'GET';
        var referrer         = event.referrer         || '';
        var headers          = event.headers          || {};
        var httpResponseCode = event.httpResponseCode || 0;
        var httpResponseStr  = 'Unknown';
        if ( httpResponseCode in HTTPSTATUS ) {
            httpResponseStr  = HTTPSTATUS[httpResponseCode];
        }
        var details          = {}
        details.status       = httpResponseCode;
        details.status_str   = httpResponseStr;
        if ( newUrl !== originalUrl ) {
            details.original = originalUrl;
        }
        details.headers      = headers;
        Log.dump(requestMethod, newUrl, details);
        return true;
    };

    /**
     * ページタイトルを更新するイベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handlePageTitleSetEvent = function(event) {
        var prefix     = account.titleprefix || '';
        var suffix     = account.titlesuffix || '';
        document.title = prefix + event.title + suffix;
        return true;
    };

    /**
     * ページfaviconを更新するイベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handlePageFaviconUpdatedEvent = function(event) {
        var favicon          = (event.favicons || []).shift() || '';
        // faviconがあるか？
        if ( favicon === '' ) {
            return true;
        }
        elements.favicon.src = favicon;
        return true;
    };

    /**
     * faviconが読み込まれたイベントの処理
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleFaviconLoad = function(event) {
        if ( ! account.partition ) {
            // まだ_handleInitWebContentsが完了していない
            return true;
        }
        if ( elements.favicon.src === favicon ) {
            return true;
        }
        var from     = favicon;
        favicon      = elements.favicon.src;
        if ( favicon.indexOf('/img/spinner.gif') > -1 ) {
            favicon  = '';
            return true;
        }
        // 更新するべきかチェック
        var checkurl = elements.url.value.replace(/#.*$/g, '');
        if ( favorites.indexOf(checkurl) < 0 ) {
            // 更新不要
            return true;
        }
        // faviconが変わったので保存して更新する
        if ( from !== '' &&  from.indexOf('/img/spinner.gif') === -1 ) {
            Log.dump('favicon is changed:', { from: from, to: elements.favicon.src });
        }
        var dataUrl  = _toDataUrl(elements.favicon);
        var base     = [
            App.getPath('userData'),
            'uploads',
            account.partition,
            'favicons',
        ].join('/');
        var file         = base + '/favicon.png';
        File.writeDataUrl(dataUrl, file, true);
        // 更新する
        var favs         = account.favorites
        for ( var i in account.favorites ) {
            var each     = account.favorites[i] || {url: ''};
            var url      = each.url.replace(/#.*$/g, '');
            if ( url === checkurl ) {
                // お気に入りのfaviconである
                var dest = base + '/' + i + '.png';
                File.copy(file, dest, true);
                Config.setFavicon(account.name, i, dest);
            }
        }
        return true;
    };

    /**
     * ローディングインジケーターの表示
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    var _startLoading = function() {
        elements.loading.style.display = 'inline-block';
        return true;
    };

    /**
     * ローディングインジケーターの非表示
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    var _stopLoading = function() {
        elements.loading.style.display = 'none';
        _updateCanGoBack();
        return true;
    };

    /**
     * 新規ウィンドウを開くイベント
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleNewWindowEvent = function(event) {
        event.preventDefault();
        var frameName = event.frameName || '_blank';
        var url       = event.url       || 'about:blank';
        Log.dump('Open url from ' + frameName + ':', url, 'info');
        Shell.openExternal(url);
        return true;
    };

    /**
     * 戻る進むボタンの有効化/無効化
     *
     * @method
     * @return  {Boolean}   true
     * @public
     */
    var _updateCanGoBack = function() {
        var canGoBack               = webview.instance.canGoBack();
        var canGoForward            = webview.instance.canGoForward();
        if ( elements.goBack !== null ) {
            elements.goBack.disabled    = ! canGoBack;
        }
        if ( elements.goForward !== null ) {
            elements.goForward.disabled = ! canGoForward;
        }
        return EachWindow.updateCanGoBack(account.name, canGoBack, canGoForward);
    };

    /**
     * contextmenuイベントハンドラ
     *
     * @method
     * @param   {Object}    event       イベント
     * @param   {Object}    ipcevent    IPCメッセージイベント
     * @return  {Boolean}   true
     * @private
     */
    handlers.contextmenu = function(event, ipcevent) {
        var canGoBack    = webview.instance.canGoBack();
        var canGoForward = webview.instance.canGoForward();
        return Popup.show(account.name, event.srcElement, canGoBack, canGoForward);
    };

    /**
     * openDevToolsイベントハンドラ
     *
     * @method
     * @param   {Object}    event       イベント
     * @param   {Object}    ipcevent    IPCメッセージイベント
     * @return  {Boolean}   true
     * @private
     */
    handlers.openDevTools = function(event, ipcevent){
        if ( webview.instance ) {
            webview.instance.openDevTools();
        } else {
            Log.warn('WebView openDevTools error: webview instance does not exist.');
        }
        return true;
    };

    /**
     * reloadイベントハンドラ
     *
     * @method
     * @param   {Object}    event       イベント
     * @param   {Object}    ipcevent    IPCメッセージイベント
     * @return  {Boolean}   true
     * @private
     */
    handlers.reload = function(event, ipcevent){
        if ( webview.instance ) {
            webview.instance.reload();
        } else {
            Log.warn('WebView reload error: webview instance does not exist.');
        }
        return true;
    };

    /**
     * 印刷ダイアログを開く
     *
     * @method
     * @param   {MenuItem}      item
     * @param   {BrowserWindow} win
     * @return  {Boolean}       true
     * @private
     */
    handlers.print = function(item, win) {
        if ( webview.instance ) {
            webview.instance.print();
        } else {
            Log.warn('WebView print error: webview instance does not exist.');
        }
        return true;
    };

    /**
     * 戻る
     *
     * @method
     * @param   {MenuItem}      item
     * @param   {BrowserWindow} win
     * @return  {Boolean}       true
     * @private
     */
    handlers.goBack = function(item, win) {
        _sendMessageToClient('goBack', {});
        return true;
    };

    /**
     * 進む
     *
     * @method
     * @param   {MenuItem}      item
     * @param   {BrowserWindow} win
     * @return  {Boolean}       true
     * @private
     */
    handlers.goForward = function(item, win) {
        _sendMessageToClient('goForward', {});
        return true;
    };

    /**
     * ホームへ移動する
     *
     * @method
     * @param   {MenuItem}      item
     * @param   {BrowserWindow} win
     * @return  {Boolean}       true
     * @private
     */
    handlers.goHome = function(item, win) {
        var url            = account.svcurl;
        elements.url.value = url;
        _sendMessageToClient('goHome', {url: url});
        return true;
    };

    /**
     * お気に入りへ移動する
     *
     * @method
     * @param   {MenuItem}      item
     * @param   {BrowserWindow} win
     * @return  {Boolean}       true
     * @private
     */
    handlers.goFavorite = function(item, win) {
        var hash           = (item||{}).id || '';
        var fav            = account.favorites[hash] || {};
        elements.url.value = fav.url;
        _sendMessageToClient('goFavorite', {url: fav.url});
        return true;
    };

    /**
     * お気に入り追加/削除
     *
     * @method
     * @param   {MenuItem}      item
     * @param   {BrowserWindow} win
     * @return  {Boolean}       true
     * @private
     */
    handlers.toggleFavorites = function(item, win) {
// ★★★★
        var url      = elements.url.value;
        var checkurl = url.replace(/#.*$/g, '');
        var action   = 'add';
        if ( favorites.indexOf(checkurl) > -1 ) {
            action   = 'delete';
        }
        Util.dump({
            method:   'WebView::handlers.toggleFavorites',
            url:      url,
            checkurl: checkurl,
            action:   action,
        }, 'お気に入り追加/削除');
        return true;
    };

    /**
     * webviewを初期化する
     *
     * @method
     * @param   {Object}    params
     * @return  {Boolean}   true
     * @private
     */
    var _handleInitWebContents = function(params) {
        var name                   = ('' + params.name) || 'invalid name'
        Log.info('Open each window. (accountname: "' + name + '") [pid=' + process.pid + ']');
        if ( name === 'invalid name' ) {
            // 無効
            return false;
        }
        account                    = Config.getAccountByName(name);
        // webviewを生成
        webview.id                 = 'webview';
        var instance               = document.createElement('webview');
        instance.id                = 'webview';
        instance.autosize          = 'on';
        instance.partition         = 'persist:' + account.partition;
        instance.nodeintegration   = false;
        instance.preload           = './lib/WebViewLoader.js'
        instance.src               = './loading.html';
        elements.holder.appendChild(instance);
        webview                    = {
            id:         params.webview,
            instance:   instance,
            process:    0,
        };
        // client to host間通信
        webview.instance.addEventListener('ipc-message',              _handleIPCMessage);
        webview.instance.addEventListener('did-start-loading',        _handleStartLoadingEvent);
        webview.instance.addEventListener('did-stop-loading',         _handleStopLoadingEvent);
        webview.instance.addEventListener('did-finish-load',          _handleFinishLoadEvent);
        webview.instance.addEventListener('did-get-response-details', _handleGetResponseDetailsEvent);
        webview.instance.addEventListener('new-window',               _handleNewWindowEvent);
        webview.instance.addEventListener('page-title-set',           _handlePageTitleSetEvent);
        webview.instance.addEventListener('page-favicon-updated',     _handlePageFaviconUpdatedEvent);
        // お気に入り
        var favs                   = account.favorites || {};
        favorites                  = [];
        for ( var i in favs ) {
            favorites.push((favs[i].url||'').replace(/#.*$/g, ''));
        }
        // メモリ使用量を保存 → 解放はEachWindow::_handleClosedで行う
        MemoryUsage.init('each:' + name);
        // 初期化が完了したら読み込む
        setTimeout(_loadFirst, 0);
        return true;
    };

    /**
     * webviewのpidの更新をリクエスト
     *
     * @method
     * @return  {Boolean}   true
     * @private
     */
    var _requestUpdateWebViewPid= function() {
        _sendMessageToClient('updateWebViewPid', {});
        return true;
    };

    /**
     * webviewのpidの更新
     *
     * @method
     * @param   {Object}    event       イベント
     * @param   {Object}    ipcevent    IPCメッセージイベント
     * @return  {Boolean}   true
     * @private
     */
    handlers.updateWebViewPid = function(event, ipcevent){
        if ( webview.process === event.process ) {
            // 変化なし
            return true;
        }
        // 変化あり → 更新
        var pid         = webview.process || 0;
        if ( pid > 0 ) {
            MemoryUsage.clear('webview.' + pid);
        }
        webview.process = event.process;
        return true;
    };

    /**
     * mainプロセスからのメッセージを処理
     *
     * @method
     * @param   {Object}    params
     * @return  {Boolean}   true
     * @private
     */
    var _handleMainMessage = function(params) {
        params            = Util.enforceObject(params);
        var type          = Util.enforceString(params.type);
        var r             = false;
        switch (type) {
            // 子プロセスへ送る
            case 'child':
                r         = _handleMessageChild(params);
                break;

            // renderプロセスのイベント
            case 'event':
            default:
                var event = Util.enforceObject(params.event);
                r         = _handleIPCMessage(event);
                break;
        }
        return r;
    };

    /**
     * mainプロセスからのメッセージを子プロセスへ送る
     *
     * @method
     * @param   {Object}    params
     * @return  {Boolean}   true
     * @private
     */
    var _handleMessageChild = function(params) {
        var id    = Util.enforceString(params.child, webview.id);
        if ( id === '' ) {
            Log.dump('empty child id to send message.', params, 'warn');
            return false;
        }
        var child = document.getElementById(id) || {};
        var type  = Util.getType(child.send);
        if ( type !== 'function' ) {
            // 送ることができるか？
            Log.dump('child.send of ' + id + ' is not a function:', child.send, 'warn');
            return false;
        }
        // 送る
        return child.send(EVENT.MAIN_MESSAGE, params);;
    };

    /**
     * IPCメッセージを処理する
     *
     * @method
     * @param   {Object}    event
     * @return  {Boolean}   true
     * @private
     */
    var _handleIPCMessage = function(ipcevent) {
        // チャンネルがハンドラになければ処理しない
        if ( ( ipcevent.channel in handlers ) !== true ) {
            return false;
        }
        // イベントコールの形に構成しなおしてコール
        var args      = [].concat(ipcevent.args);
        var orig      = args.shift();
        var event     = {};
        for ( var i in orig ) {
            event[i]  = orig[i];
        }
        ipcevent.args = [];
        args          = [ event, ipcevent ].concat(args);
        return handlers[ipcevent.channel].apply(this, args);
    };

    /**
     * mainプロセスにIPCメッセージを送る
     *
     * @method
     * @param   {String}        channel
     * @param   {Array}         args
     * @return  {Boolean}       true
     * @private
     */
    var _sendMessage = function(channel, args) {
        // IPCイベントパラメータを構成
        var params = {
            type:        'event',
            event:       {
                channel: channel,
                args:    args,
            }
        };
        return IPC.send(EVENT.RENDER_MESSAGE, params);
    };

    /**
     * mainプロセスにIPCメッセージを送る
     *
     * @method
     * @param   {String}        channel
     * @param   {Array}         args
     * @return  {Boolean}       true
     * @private
     */
    var _sendMessageToClient = function(channel, args) {
        // IPCイベントパラメータを構成
        var params = {
            type:        'event',
            event:       {
                channel: channel,
                args:    args,
            }
        };
        return webview.instance.send(EVENT.RENDER_MESSAGE, params);
    };

    /**
     * 画像をdataUrl形式に変換
     *
     * @method
     * @param   {HTMLElement}   img
     * @param   {Number}        width
     * @param   {Number}        height
     * @param   {HTMLDocument}  document
     * @return  {Boolean}       true
     * @public
     */
    var _toDataUrl = function(img, width, height, d) {
        var width               = width  || img.width;
        var height              = height || img.height;
        var d                   = document;
        var canvas              = d.createElement('canvas');
        var context             = canvas.getContext('2d');
        canvas.height           = height;
        canvas.width            = width;
        canvas.style.background = 'transparent';
        context.drawImage(img, 0, 0, height, width);
        return canvas.toDataURL();
    };

    // -------------------------------------------------------------------------
    return self;
};
