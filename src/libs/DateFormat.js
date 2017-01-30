"use strict";
/**
 * DateFormat モジュール
 *
 * @module  {DateFormat}    DateFormat
 * @class   {DateFormat}
 */
module.exports = new (function DateFormat() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * 日時文字列にする
     */
    const _init = function _init() {
    };

    /**
     * 日時文字列にする
     *
     * @param   {String}    format
     * @param   {Number}    time        1970/01/01 00:00:00 UTCからの経過秒
     * @return  {String}    日時文字列
     */
    const _strftime = function _strftime(format='%Y/%m/%d %H:%M:%S.%N', time=-1) {
        const now    = new Date();
        if ( isFinite(time) === true && time >= 0.0 ) {
            now.setTime(time*1000);
        }
        const result = format.replace(/%([\d\x20\x2d]?)([A-Za-z])/g, function(match, $p1, $p2){
            switch ( $p2 ) {
                case 'Y':
                    match = ('0000' +  now.getFullYear()    ).substr(-4);
                    break;
                case 'm':
                    match = ('00'   + (now.getMonth() + 1)  ).substr(-2);
                    break;
                case 'd':
                    match = ('00'   +  now.getDate()        ).substr(-2);
                    break;
                case 'H':
                    match = ('00'   +  now.getHours()       ).substr(-2);
                    break;
                case 'M':
                    match = ('00'   +  now.getMinutes()     ).substr(-2);
                    break;
                case 'S':
                    match = ('00'   +  now.getSeconds()     ).substr(-2);
                    break;
                case 'N': case 'L':
                    match = ('000'  +  now.getMilliseconds()).substr(-3);
                    break;
                case 's':
                    match = Math.floor(now.getTime() / 1000);
                    break;
                case 'Z': case 'z':
                    let o = now.getTimezoneOffset();
                    let q =  o    % 60;
                    let p = (o-q) / 60;
                    match = '+' + ('00' + p).substr(-2) + ('00' + q).substr(-2);
                    break;
                case 'n':
                    match = EOL;
                    break;
                case 't':
                    match = TAB;
                    break;
                default:
                    break;
            }
            return match;
        });
        return result;
    };

    // -------------------------------------------------------------------------
    /**
     * 日時文字列にする
     *
     * @param   {String}    format
     * @param   {Number}    time
     * @return  {String}    日時文字列
     */
    self.strftime = function strftime(format='%Y/%m/%d %H:%M:%S.%3N', time=-1) {
        return _strftime(format, time);
    };
    // -------------------------------------------------------------------------
    _init();
    return self;
})();
