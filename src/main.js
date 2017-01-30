/**
 * main.js
 *
 * エントリポイント
 * mainプロセス
 */
'use strict';

// 基本のライブラリ
require(__dirname + '/libs/$IF.js');
$IF.get('./libs/Log.js');

// Mainプロセスのコントローラー実行
$IF.get('./libs/MainController.js').execute();

