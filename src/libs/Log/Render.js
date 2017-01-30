"use strict";
/**
 * LogMain モジュール
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
 * @module  {LogMain}   LogMain
 * @class   {LogMain}
 */
module.exports = new (function LogMain() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * モジュール Formatter
     *
     * @type    {Function}
     */
    const Formatter = $IF.get('./libs/Log/Formatter.js');

    /**
     * モジュール Formatter
     *
     * @type    {Function}
     */
    const Uniqid = $IF.get('./libs/Hash.js').uniq(4);

    /**
     * ロガー
     *
     * @type    {Number}
     */
    const Logger = Electron.remote.require(Path.resolve(__BASE__ + SEP + './libs/Log/Main.js'));

//     /**
//      * エラーレベル
//      *
//      * @type    {Object}
//      */
//     const LEVELS = {
//         'error':  1 << 0,
//         'warn':   1 << 1,
//         'info':   1 << 3,
//         'debug':  1 << 4,
//         'trace':  1 << 5,
//     };
//
//     /**
//      * エラーレベルのマスク(全)
//      *
//      * @type    {Number}
//      */
//     const LEVEL_MASK_ALL = LEVELS.error|LEVELS.warn|LEVELS.info|LEVELS.debug|LEVELS.trace;
//
//     /**
//      * エラーレベルのマスク
//      *
//      * @type    {Number}
//      */
// //     const LEVEL_MASK = LEVELS.error|LEVELS.warn|LEVELS.info;
//     const LEVEL_MASK = LEVEL_MASK_ALL;
//
//     /**
//      * エラーレベルのマスク
//      *
//      * @type    {Number}
//      */
//     let iMask = LEVEL_MASK;

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
     * ログ出力する
     *
     * @param   {String}    level
     * @param   {Array}     messages
     * @return  {Boolean}   true
     */
    const _log = function _log(level, messages) {
        // 情報を構成
        //  params:
        //      hidetime:   {Boolean}   時刻を表示するか否か
        //      oneline:    {Boolean}   1行で表示するか否か
        //      format:     {String}    時刻書式    (strftime書式)
        //      uniq:       {String}    識別子
        //      proc:       {String}    'main' or 'render'
        //      level:      {String}    ログレベル
        //      messages:   {Array}     メッセージ
        const args      = Formatter.format({
            hidetime: false,
            oneline:  true,
            uniq:     Uniqid,
            proc:     process.type,
            level:    level,
            messages: messages,
        });
        // コンソールは常に出力
        console[level].apply(console, args);

        // mainプロセスへ送出
        try {
            Logger.logRaw(level, args);
        } catch (e) {
            // IPC通信でmainプロセスに送出できないメッセージが含まれていた → あきらめる
        }
        return true;
    };

    // -------------------------------------------------------------------------
    /**
     * ログ出力する
     *
     * @param   {String}    level
     * @param   {Array}     messages
     * @return  {Boolean}   true
     */
    self.log = function log(level, messages) {
        return _log(level, messages);
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
