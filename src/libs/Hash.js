"use strict";
/**
 * Hash モジュール
 *
 * @module  {Hash}  Hash
 * @class   {Hash}
 */
module.exports = new (function Hash() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * Crypto モジュール
     *
     * @type    {Crypto}
     */
    const Crypto = require('crypto');

    // -------------------------------------------------------------------------
    /**
     * MD5ハッシュ
     *
     * @method
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.md5 = function md5(data, enc) {
        return self.hash('md5', data, enc);
    };

    /**
     * SHA1ハッシュ
     *
     * @method
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.sha1 = function sha1(data, enc) {
        return self.hash('sha1', data, enc);
    };

    /**
     * SHA256ハッシュ
     *
     * @method
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.sha256 = function sha256(data, enc) {
        return self.hash('sha256', data, enc);
    };

    /**
     * ハッシュ
     *
     * @method
     * @param   {String}    algo    アルゴリズム
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.hash = function hash(algo, data, enc) {
        algo = '' + ( algo || 'unknown' );
        return _calcDigest(Crypto.createHash(algo), data, enc);
    };

    /**
     * MD5 HMAC
     *
     * @method
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    key     ハッシュ値を取得するキー
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.hmac_md5 = function hmac_md5(data, key, enc) {
        return self.hmac('md5', data, key, enc);
    };

    /**
     * SHA1 HMAC
     *
     * @method
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    key     ハッシュ値を取得するキー
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.hmac_sha1 = function hmac_sha1(data, key, enc) {
        return self.hmac('sha1', data, key, enc);
    };

    /**
     * SHA256 HMAC
     *
     * @method
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    key     ハッシュ値を取得するキー
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.hmac_sha256 = function hmac_sha256(data, key, enc) {
        return self.hmac('sha256', data, key, enc);
    };

    /**
     * HMAC
     *
     * @method
     * @param   {String}    algo    アルゴリズム
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    key     ハッシュ値を取得するキー
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    self.hmac = function hmac(algo, data, key, enc) {
        algo = '' + ( algo || 'unknown' );
        key  = '' + ( key  || ''        );
        return _calcDigest(Crypto.createHmac(algo, key), data, enc);
    };

    /**
     * ハッシュ
     *
     * @method
     * @param   {Hash|Hmac} calc    計算するオブジェクト
     * @param   {String}    data    ハッシュ値を取得するデータ
     * @param   {String}    enc     取得形式 hex|binary|base64
     * @return  {String}    ハッシュ値
     * @public
     */
    const _calcDigest = function _calcDigest(calc, data, enc) {
        data    = '' + ( data || '' );
        calc.update(data, 'binary');
        enc     = '' + ( enc  || 'hex' );
        let i   = ['hex', 'binary', 'base64'].indexOf(enc);
        if ( i < 0 ) {
            enc = 'hex';
        }
        return calc.digest(enc);
    };

    /**
     * ユニークID
     *
     * @method
     * @param   {Number}    len
     * @return  {String}    uniqid
     * @private
     */
    self.uniq = function uniq(len) {
        const hash = self.sha1((new Date()).toString() + '' + Math.random());
        if ( len < 3 || 32 < len || isNaN(len) === true ) {
            len    = 6;
        }
        return hash.substr(0, len);
    };

    // -------------------------------------------------------------------------
    return self;
})();
