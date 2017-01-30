"use strict";
/**
 * Log モジュール
 *
 * 仕組み:
 *      mainプロセス(通常)
 *          1.  Log.info(msg)                           Logクラス
 *          2.  ログレベル判定                          Logクラス
 *          3.  console出力                             LogMainクラス
 *          4.  ログファイル出力                        LogMainクラス
 *
 *      renderプロセス
 *          1.  Log.info(msg)                           Logクラス
 *          2.  ログレベル判定                          Logクラス
 *          3.  console出力                             LogRenderクラス
 *          4.  文字列化                                LogRenderクラス
 *          5.  IPC通信でmainプロセスにログ出力通知     LogRenderクラス
 *
 *      mainプロセス(IPC通信受信) → ログレベル判定しない
 *          1.  mainプロセスのconsole出力               LogMainクラス
 *          2.  ログファイル出力                        LogMainクラス
 *
 * @module  {Log}   Log
 * @class   {Log}
 */
module.exports = new (function Log() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * エラーレベル
     *
     * @type    {Object}
     */
    const LEVELS = {
        'error':  1 << 0,
        'warn':   1 << 1,
        'info':   1 << 3,
        'debug':  1 << 4,
        'trace':  1 << 5,
    };

    /**
     * エラーレベルのマスク(全)
     *
     * @type    {Number}
     */
    const LEVEL_MASK_ALL = LEVELS.error|LEVELS.warn|LEVELS.info|LEVELS.debug|LEVELS.trace;

    /**
     * エラーレベルのマスク
     *
     * @type    {Number}
     */
//     const LEVEL_MASK = LEVELS.error|LEVELS.warn|LEVELS.info;
    const LEVEL_MASK = LEVEL_MASK_ALL;

    /**
     * エラーレベルのマスク
     *
     * @type    {Number}
     */
    let iMask = LEVEL_MASK;

    /**
     * ロガー
     *
     * @type    {Number}
     */
    const Logger = { log: console.log.bind(console) };

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
        iMask = LEVEL_MASK;
        if ( process.type === 'renderer' ) {
            // renderプロセス
            Logger.log = $IF.get('./libs/Log/Render.js').log;
        } else {
            // mainプロセス
            Logger.log = $IF.get('./libs/Log/Main.js').log;
        }

        // グローバルコンテキストとベースのライブラリに追加
        Object.defineProperty(global, 'Log', {
            value:          self,
            writable:       false,
            enumerable:     false,
            configurable:   true,
        });
        Object.defineProperty($IF, 'Log', {
            value:          self,
            writable:       false,
            enumerable:     false,
            configurable:   true,
        });
        return true;
    };

    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    const _log = function _log() {
        // 動的パラメータを配列にする
        const args = Array.prototype.slice.call(arguments);
        if ( args.length < 1 ) {
            console.warn('Log: empty message.');
            return true;
        }
        const level = args.shift() || 'unknown log level';
        // レベルを特定
        let iLevel = LEVELS.info;
        if ( level in LEVELS ) {
            iLevel = LEVELS[level];
        } else {
            iLevel = LEVELS.info;
        }
        if ( ( iLevel & iMask ) === 0 ) {
            // そのレベルはログ出力しない
            return true;
        }
        // プロセスごとに処理を任せる
        return Logger.log(level, args);
    };

    // -------------------------------------------------------------------------
    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    self.error = function error() {
        return _log.apply(self, ['error'].concat(Array.prototype.slice.call(arguments)));
    };

    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    self.warn = function warn() {
        return _log.apply(self, ['warn'].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    self.info = function info() {
        return _log.apply(self, ['info'].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    self.debug = function debug() {
        return _log.apply(self, ['debug'].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    self.log = function log() {
        return _log.apply(self, ['info'].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * ログ出力する
     *
     * @param   {String}    message
     * @return  {Boolean}   true
     */
    self.dump = function dump() {
        return _dump.apply(self, Array.prototype.slice.call(arguments));
    }

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
