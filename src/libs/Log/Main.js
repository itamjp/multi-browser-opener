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
     * ログファイル
     *
     * @type    {String}
     */
    const LOGFILE = __DATA__ + SEP + __PRODUCT_NAME__ + '-trace.log';

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
        return _logRaw(level, args);
    };

    /**
     * 整形済みのログ出力する
     *
     * @param   {String}    level
     * @param   {Array}     args
     * @return  {Boolean}   true
     */
    const _logRaw = function _logRaw(level, args) {
        // コンソールは常に出力
        console[level].apply(console, args);

        // ファイルへの出力
        const out           = args.splice(0, 4);
        if ( args.length > 0 ) {
            for ( let i in args ) {
                if ( ( typeof args[i] ) === 'string' ) {
                    args[i] = args[i];
                } else {
                    args[i] = Util.inspect(args[i], {breakLength: 60});
                }
            }
        }
        out.push(args.join(EOL));
        FS.appendFileSync(LOGFILE, out.join(TAB) + EOL);
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

    /**
     * 整形済みのログ出力する
     *
     * @param   {String}    level
     * @param   {Array}     args
     * @return  {Boolean}   true
     */
    self.logRaw = function logRaw(level, args) {
        return _logRaw(level, args);
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
