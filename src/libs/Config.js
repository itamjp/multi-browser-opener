"use strict";
/**
 * Config モジュール
 *
 * @module  {Config}    Config
 * @class   {Config}
 */
module.exports = new (function Config() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * 設定ファイル
     *
     * @type    {String}    CONFIGFILE
     */
    const CONFIGFILE = __DATA__ + SEP + 'config-data.json';

    /**
     * 設定データ
     *
     * @type    {Object}
     */
    let data = {
        menu: {
            pos: {
                x:      null,
                y:      null,
                width:  500,
                height: 500,
                center: true,
            },
        },
        accounts: {},
        partition: []
    };

    /**
     * アカウントキー
     *
     * @type    {Object}
     */
    let accountkeys = {};

    // -------------------------------------------------------------------------
    /**
     * 読み込み実行
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _init = function _init() {
Log.info(__HERE__);
        let json                             = '';
        let obj                              = null;
        let name                             = '';
        try {
            json                             = FS.readFileSync(CONFIGFILE);
            obj                              = JSON.parse(json);
            if ( _typeOf(obj) !== 'object' ) {
                throw new Error('Malformed JSON data in ' + CONFIGFILE + '.');
            }
            data                                    = _merge(data, obj);
            accountkeys                             = {};
            for ( let key in data.accounts ) {
                data.accounts[key].key = key;
                name                   = data.accounts[key].name
                accountkeys[name]      = key;
            }
        } catch (e) {
            if ( e.code === 'ENOENT' ) {
                // ファイルが存在しない → デフォルトの構造で一旦保存
                self.save();
            } else {
                // JSONではない
                Log.info(__HERE__, 'json:', '' + json);
                Log.info(__HERE__, 'obj:',  obj);
                alert(e, 'Cofig loading error', 'error');
                $IF.quit();
            }
        }
        // 整形 → いずれ考える
        // data.accounts           = _refineAccounts(data.accounts);

        // 起動オプションの処理 → いずれ考える
//         // parse arguments
//         var each                = '';
//         var name                = '';
//         var pair                = [];
//         for ( var i=2; i<process.argv.length ; i++ ) {
//             each                = '' + process.argv[i];
//             argv.push(each);
//             name                = each.replace(/^--([A-Za-z0-9])/, '$1');
//             if ( name === each ) {
//                 continue;
//             }
//             pair                = name.split(/=/, 2);
//             if ( pair.length < 2 ) {
//                 params[pair[0]] = true;
//             } else {
//                 params[pair[0]] = pair[1];
//             }
//         }
//
//         // parse arguments
//         isDebugMode             = Util.enforceBoolean(params.debug    || false);
//         isDevToolsOpened        = Util.enforceBoolean(params.devtools || params.debug);

        return true;
    };

    /**
     * データを保存する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.save = function save() {
        return FS.writeFileSync(CONFIGFILE, JSON.stringify(data, null, 2) + "\n");
    };

    /**
     * メニュー設定を取得する
     *
     * @type    {Function}
     * @method
     * @return  {Object}    メニュー設定
     */
    self.getMenu = function getMenu() {
        return Object.assign({}, data.menu);
    };

    /**
     * メニュー設定を保存する
     *
     * @type    {Function}
     * @method
     * @param   {Object}    メニュー設定
     * @return  {Boolean}   true
     */
    self.setMenu = function setMenu(value) {
        // "menu": {
        //   "pos": {
        //     "x": 596,
        //     "y": 56,
        //     "width": 500,
        //     "height": 500,
        //     "center": false
        //   }
        // },
        data.menu = _merge(data.menu, value||{}, true)||{};
        return true;
    };

    /**
     * アカウント情報を取得する(有効な値のみ)
     *
     * @type    {Function}
     * @method
     * @return  {Object}    アカウント情報
     */
    self.getAccountsValid = function getAccountsValid() {
        return self.getAccounts(true);
    };

    /**
     * アカウント情報を取得する
     *
     * @type    {Function}
     * @method
     * @param   {Boolean}   isValid
     * @return  {Object}    アカウント情報
     */
    self.getAccounts = function getAccounts(isValid) {
        const all = _merge({}, data.accounts, true);
        if ( isValid !== true ) {
            // 有効な値のみでなければそのまま返す
            return all;
        }
        for ( let i in all ) {
            if ( all[i].valid === false ) {
                delete(all[i]);
            }
        }
        return all;
    };

    /**
     * アカウント情報を取得する
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @return  {Object}    アカウント情報
     */
    self.getAccountInfo = function getAccountInfo(name) {
        name      = '' + name;
        const key = '' + (accountkeys[name] || name);
        if ( ( key in data.accounts ) !== true ) {
            return null;
        }
        // キー名があれば返す
        return _merge({}, data.accounts[key], true);
    };

    /**
     * アカウント情報を保存する
     *
     * @type    {Function}
     * @method
     * @param   {String}    name
     * @param   {Object}    conf
     * @return  {Object}    アカウント情報
     */
    self.setAccountInfo = function setAccountInfo(name, conf) {
        name               = '' + name;
        const key          = '' + (accountkeys[name] || name);
        if ( ( key in data.accounts ) !== true ) {
            return null;
        }
        // キー名があれば保持する
        if ( _typeOf(conf) !== 'object' ) {
            throw new Error('conf is not an object.');
        }
        data.accounts[key] = _merge({}, conf, true);
        return data.accounts[key];
    };

    /**
     * オブジェクトをマージする
     *
     * @type    {Function}
     * @method
     * @param   {Object}    a1
     * @param   {Object}    a2
     * @param   {Boolean}   overwrite
     * @return  {Object}    マージしたオブジェクト
     */
    const _merge = function _merge(a1, a2, overwrite) {
        // JSON化できない変数は想定しない
        return _mergeRecursively(JSON.parse(JSON.stringify(a1)), JSON.parse(JSON.stringify(a2)), overwrite)
    };

    /**
     * オブジェクトをマージする
     *
     * @type    {Function}
     * @method
     * @param   {Object}    v1
     * @param   {Object}    v2
     * @param   {Boolean}   overwrite
     * @return  {Object}    マージしたオブジェクト
     */
    const _mergeRecursively = function _mergeRecursively(v1, v2, overwrite) {
        const v1type = _typeOf(v1);
        const v2type = _typeOf(v2);
        if ( v1type === v2type ) {
            // 型が同じなのでマージできる
            if ( v1type === 'object' ) {
                // オブジェクトのマージ
                return _mergeObject(v1, v2, overwrite);
            }
            if ( v1type === 'array' ) {
                // 配列のマージ
                return v1.concat(v2);
            }
        }
        // 型が違うかマージできない型 → マージはできないのでそのまま返す
        if ( overwrite === true ) {
            return v2;
        }
        return v1;
    };

    /**
     * オブジェクトをマージする
     *
     * @type    {Function}
     * @method
     * @param   {Object}    v1
     * @param   {Object}    v2
     * @param   {Boolean}   overwrite
     * @return  {Object}
     */
    const _mergeObject = function _mergeObject(v1, v2, overwrite) {
        // キーの一覧でループを回す
        const keys    = Array.from(new Set(Object.keys(v1).concat(Object.keys(v2))));
        for ( let i of keys ) {
            if ( ( i in v2 ) === false ) {
                // v2にない場合は次へ
                continue;
            }
            if ( ( i in v1 ) === false ) {
                // v1にない場合はv2をコピーして次へ
                v1[i] = v2[i];
            }
            // 両方にある → マージ？
            v1[i]     = _mergeRecursively(v1[i], v2[i], overwrite);
        }
        return v1;
    };

    /**
     * 型を取得
     *
     * @type    {Function}
     * @method
     * @param   {Mixed}     型を知りたい値
     * @return  {String}    型
     * @private
     */
    const _typeOf = function _typeOf(value) {
        return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    };
    // -------------------------------------------------------------------------
    _init();
    return self;
})();

if ( false ) {
let ZZZ = new (function ZZZConfig() {
    /**
     * Hash クラス
     *
     * @type    {Hash}
     */
    const Hash = require('./Hash');

    /**
     * デバッグモードフラグ
     *
     * @type    {Boolean}
     */
    var isDebugMode = false;

    /**
     * Developer Toolsを開いているか否か
     *
     * @type    {Boolean}
     */
    var isDevToolsOpened = false;
    var data             = {
        menu:       {},
        accounts:   {},
        partition:  []
    };
    var argv             = [];
    var params           = {};
    const App = require('electron').app;
    const FS = require('electron').fs;
    const Crypto = require('electron').crypto;
    const Util = require('./Util');
    const CONFIGFILE       = __DATA__ + '/config-data.json';
    var AppPath          = __dirname;
    var DIRSEP           = '/';

    // -------------------------------------------------------------------------
    // 読み込み実行
    var _load = function() {
        if ( process.platform === 'win32' ) {
            DIRSEP       = '\\';
        }
        try {
            var json            = FS.readFileSync(CONFIGFILE);
            var obj             = JSON.parse(json);
            var type            = Util.getType(obj);
            if ( type !== 'object' ) {
                throw new Error('Malformed JSON data in ' + CONFIGFILE + '.');
            }
            data                = obj;
        } catch (e) {
            if ( e.code === 'ENOENT' ) {
                // ファイルが存在しない → デフォルトの構造で記載
                self.save();
            } else {
                // JSONではない
                Util.error(e, 'Cofig loading error');
                App.quit();
            }
        }
        data.accounts           = _refineAccounts(data.accounts);

        // parse arguments
        var each                = '';
        var name                = '';
        var pair                = [];
        for ( var i=2; i<process.argv.length ; i++ ) {
            each                = '' + process.argv[i];
            argv.push(each);
            name                = each.replace(/^--([A-Za-z0-9])/, '$1');
            if ( name === each ) {
                continue;
            }
            pair                = name.split(/=/, 2);
            if ( pair.length < 2 ) {
                params[pair[0]] = true;
            } else {
                params[pair[0]] = pair[1];
            }
        }

        // parse arguments
        isDebugMode             = Util.enforceBoolean(params.debug    || false);
        isDevToolsOpened        = Util.enforceBoolean(params.devtools || params.debug);

        // help
        return true;
    };
    // -------------------------------------------------------------------------
    var _refineAccounts = function(accounts) {
return accounts;
accounts = {
    length: 6,
    'hash:a':
    {
        name:       '1account-is-hogehoge+ahogehoge@long.domain.name.com.info',
        icon:       './img/ifollow-icon16.png',
        svcname:    'gmail',
        svcicon:    './img/ifollow-icon32.png',
        svcurl:     'https://hoge.com/hogehoge',
        partition:  'abc',
        start:      false,
    },
    'hash:b':
    {
        name:       '2account-is-hogehoge+ahogehoge@long.domain.name.com.info',
        icon:       './img/slorn-icon16.png',
        svcname:    'google clendar',
        svcicon:    './img/ifollow-favicon-48.ico',
        svcurl:     'https://hoge.com/hogehoge',
        partition:  'abc',
        start:      false,
    },
    'hash:c':
    {
        name:       'hojo@ifollow.co.jp',
        icon:       './img/ifollow-icon16.png',
        svcname:    'hoge',
        svcicon:    './img/ifollow-favicon-48.ico',
        svcurl:     'https://calendar.google.com/calendar/render',
        partition:  'hojo@ifollow.co.jp',
        "pos": {
            "x":        14,
            "y":        12,
            "width":    500,
            "height":   500,
            "center":   false
        },
        start:      false,
    },
    'hash:d':
    {
        name:       'hojo@i3design.co.jp',
        icon:       './img/slorn-icon16.png',
        svcname:    'hoge',
        svcicon:    './img/ifollow-favicon-48.ico',
        svcurl:     'https://calendar.google.com/calendar/render',
        partition:  'hojo@i3design.co.jp',
        "pos": {
            "x":        214,
            "y":        212,
            "width":    500,
            "height":   500,
            "center":   false
        },
        start:      false,
    },
    'hash:e':
    {
        name:       'hojo@salesone.co.jp',
        icon:       './img/ifollow-icon16.png',
        svcname:    'hoge',
        svcicon:    './img/ifollow-favicon-48.ico',
        svcurl:     'https://calendar.google.com/calendar/render',
        partition:  'hojo@salesone.co.jp',
        start:      false,
    },
    'hash:f':
    {
        name:       'Masaki.Hojo@gmail.com',
        icon:       './img/favicon.ico',
        svcicon:    './img/ifollow-favicon-48.ico',
        svcurl:     'https://hoge.com/hogehoge',
        partition:  'Masaki.Hojo@gmail.com',
        start:      false,
    },
};
        return accounts;
    };

    self.getAccounts = function(menuflag) {
        var all = self.getObject('accounts');
        if ( menuflag === true ) {
            for ( var i in all ) {
                if ( all[i].valid === false ) {
                    delete(all[i]);
                }
            }
        }
        return all;
    };
    // -------------------------------------------------------------------------
    self.addAccount = function(account) {
        data.accounts.push(account);
        return self.save();
    };
    self.getAccount = function(key) {
require('./Log').dump('getAccount: key: ', key, 'info');
        if ( key === 'length' || ( key in data.accounts ) !== true ) {
            return null;
        }
        var conf = Util.enforceObject(data.accounts[key]);
        return conf;
    };
    self.getAccountByName = function(name) {
require('./Log').dump('getAccountByName: name: ', name, 'info');
require('./Log').dump('getAccountByName: Hash.md5(name): ', Hash.md5(name), 'info');
        return self.getAccount('hash:' + Hash.md5(name));
    };
    self.setAccount = function(key, conf) {
        var key            = Util.enforceString(key);
require('./Log').dump('setAccount: key: ', key, 'info');
        if ( key === 'length' || ( key in data.accounts ) !== true ) {
            return null;
        }
        conf               = Util.enforceObject(conf);
        data.accounts[key] = conf;
        return data.accounts[key];
    };
    self.setAccountByName = function(name, conf) {
require('./Log').dump('setAccountByName: name: ', name, 'info');
require('./Log').dump('setAccountByName: Hash.md5(name): ', Hash.md5(name), 'info');
        return self.setAccount('hash:' + Hash.md5(name), conf);
    };
    self.setFavicon = function(name, hash, favicon) {
        var key       = 'hash:' + Hash.md5(name);
        if ( ( key in data.accounts ) !== true ) {
            return null;
        }
        var favorites = data.accounts[key].favorites || {};
        hash          = '' + ( hash || '' );
        if ( ( hash in favorites ) !== true ) {
            return null;
        }
        data.accounts[key].favorites[hash].favicon = favicon;
        return data.accounts[key].favorites[hash].favicon;
    };
    // -------------------------------------------------------------------------
    self.save = function() {
        return FS.writeFileSync(CONFIGFILE, JSON.stringify(data, null, 2) + '\n');
    };
    // -------------------------------------------------------------------------
    self.getMenu = function() {
        return self.getObject('menu');
    };
    // -------------------------------------------------------------------------
    self.setMenu = function(v) {
        return self.setObject('menu', v);
    };
    // -------------------------------------------------------------------------
    self.get = function(i, d) {
        var v = null;
        if ( data.hasOwnProperty(i) !== true ) {
            v = d;
        } else {
            v = data[i];
        }
        return v;
    };
    self.getString = function(i, d) {
        var v = '';
        if ( data.hasOwnProperty(i) !== true ) {
            v = d || '';
        } else {
            v = data[i];
        }
        return Util.enforceString(v);
    };
    self.getObject = function(i, d) {
        var v = {};
        if ( data.hasOwnProperty(i) !== true ) {
            v = d || {};
        } else {
            v = Util.extend({}, data[i]);
        }
        return Util.enforceObject(v);
    };
    self.getArray = function(i, d) {
        var v = [];
        if ( data.hasOwnProperty(i) !== true ) {
            v = d;
        } else {
            v = data[i];
        }
        return Util.enforceArray(v);
    };
    self.getBoolean = function(i, d) {
        var v     = false;
        if ( data.hasOwnProperty(i) !== true ) {
            if ( d === true ) {
                v = true;
            }
        } else {
            if ( data[i] === true ) {
                v = true;
            }
        }
        return v;
    };
    // -------------------------------------------------------------------------
    self.setObject = function(i, v) {
        data['' + i] = Util.enforceObject(v);
        return true;
    };
    // -------------------------------------------------------------------------
    /**
     * デバッグモードか否か
     *
     * @method
     * @return  {Boolean}
     * @public
     */
    self.isDebugMode = function() {
        return isDebugMode;
    };

    self.isDevToolsOpened = function() {
        return isDevToolsOpened;
    };
    self.openDevTools = function() {
        isDevToolsOpened = true;
        return isDevToolsOpened;
    };
    self.closeDevTools = function() {
        isDevToolsOpened = false;
        return isDevToolsOpened;
    };
    self.toggleDevTools = function() {
        isDevToolsOpened = ! isDevToolsOpened;
        return isDevToolsOpened;
    };
    // -------------------------------------------------------------------------
    self.setAppPath = function(path) {
        AppPath = path;
        return AppPath;
    };
    self.getAppPath = function() {
        return AppPath;
    };
    self.relativePath = function(path) {
        var t        = Util.getType(path);
        var r        = path;
        if ( t === 'string' ) {
            r        = AppPath + DIRSEP + path.replace(/^[\/\\]/g, '');
            r        = r.replace(/[\/\\]+/g, DIRSEP).replace(DIRSEP + '.' + DIRSEP, DIRSEP);
        } else {
            for ( var i in path ) {
                r[i] = self.relativePath(path[i]);
            }
        }
        return r;
    };
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // 読み込み実行
    _load();
    // -------------------------------------------------------------------------
    _init();
    return self;
})();

}

