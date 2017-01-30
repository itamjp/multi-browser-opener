"use strict";
/**
 * Log/Formatter モジュール
 *
 * @module  {LogFormatter}  LogFormatter
 * @class   {LogFormatter}
 */
module.exports = new (function LogFormatter() {
    /**
     * 実行コンテキスト
     *
     * @type    {LogFormatter}
     */
    const self = this;

    /**
     * モジュール Formatter
     *
     * @type    {Function}
     */
    const DateFormat = $IF.get('./libs/DateFormat.js');

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
     * ログ用の書式化する
     *
     *  params:
     *      hidetime:   {Boolean}   時刻を表示するか否か
     *      oneline:    {Boolean}   1行で表示するか否か
     *      format:     {String}    時刻書式    (strftime書式)
     *      uniq:       {String}    識別子
     *      proc:       {String}    'main' or 'render'
     *      level:      {String}    ログレベル
     *      messages:   {Array}     メッセージ
     *
     * @param   {Object}    params
     * @return  {Array}     構成した情報の配列
     */
    const _format = function _format(params) {
        // 動的パラメータを配列にして返す
        const oneline    = (params||{}).oneline  ||  false;
        let   suffix     = "\n";
        if ( oneline === true ) {
            suffix       = '';
        }
        const uniq       = (params||{}).uniq     ||  '****';
        const proc       = (params||{}).proc     ||  '****';
        const level      = (params||{}).level    ||  'info';
        const messages   = (params||{}).messages || ['empty message.'];
        const result     = [
            uniq,
            proc,
            '[' + level + ']' + suffix,
        ].concat(Array.prototype.slice.call(messages));
        const hidetime   = (params||{}).hidetime ||  false;
        if ( hidetime !== true ) {
            const format = (params||{}).format   ||  '%Y/%m/%d %H:%M:%S.%3N';
            result.unshift(DateFormat.strftime(format));
        }
        return result;
    };

    // -------------------------------------------------------------------------
    /**
     * ログ用の書式化する
     *
     *  params:
     *      hidetime:   {Boolean}   時刻を表示するか否か
     *      oneline:    {Boolean}   1行で表示するか否か
     *      format:     {String}    時刻書式    (strftime書式)
     *      uniq:       {String}    識別子
     *      proc:       {String}    'main' or 'render'
     *      level:      {String}    ログレベル
     *      messages:   {Array}     メッセージ
     *
     * @param   {Object}    params
     * @return  {Array}     構成した情報の配列
     */
    self.format = function format(params) {
        return _format(params);
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
