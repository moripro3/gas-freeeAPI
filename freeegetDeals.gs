function main() {
  
  //当日入金予定の取引一覧を取得する
  var response = getDeals();
  
  //JSON形式の文字列をオブジェクトに変換する
  var obj = JSON.parse(response);
  
  //取引件数の確認
  var total_count = obj.meta.total_count;
  
  //取引データが存在する場合のみ、後続の処理を行う
  if (total_count > 0) {
    
    //取引データをスプレッドシートに書き込む
    OutputDeals(obj.deals);
    
    //チャットワーク通知用の本文を作成する
    var body = createBody(total_count);
    
    //チャットワークに送信する
    postChatwork(body);
    
  }
  
}

/**
 * freeeAPIにGETリクエストを送信して取引一覧を取得する
 *
 * @return {object} freeeAPIからのレスポンス
 */
function getDeals() {
  
  var accessToken = getService().getAccessToken();
  
  var company_id = 'xxxxxxx'; //事業所ID
  
  var date = new Date(); //現在日時
  date = Utilities.formatDate(date, 'JST', 'yyyy-MM-dd'); //表示形式を変換
  
  //リクエストURL
  var requestUrl = 'https://api.freee.co.jp/api/1/deals?' + 
    'company_id=' + company_id + 
    '&status=unsettled' +
    '&type=income' + 
    '&start_due_date=' + date +
    '&end_due_date=' + date + 
    '&limit=100';
  
  //リクエスト送信時に付与するオプションパラメータ
  var params = {
    "method" : "get",
    "headers" : {"Authorization":"Bearer " + accessToken}
  };
  
  var response = UrlFetchApp.fetch(requestUrl,params);
  
  return response;
  
}

/**
 * freeeAPIから取得したデータをスプレッドシートに書き出す
 *
 * @param {object} 取引データ
 */
function OutputDeals(objDeals) {
  
  //前回データのクリア
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('取引');
  var lastRow = sheet.getLastRow();
  
  sheet.getRange(2, 1, lastRow, 6).clearContent();//A列～F列の2行目以降をクリアする
  
  var arr = []; //空の配列を用意
  
  for(var i = 0; i < objDeals.length; i++) {
    
    var value1 = objDeals[i].issue_date; //発生日
    var value2 = objDeals[i].due_date; //支払期日
    var value3 = objDeals[i].amount; //金額
    var value4 = objDeals[i].partner_id; //取引先ID
    var value5 = objDeals[i].details[0].account_item_id; //勘定科目ID ※明細行1番目
    var value6 = objDeals[i].details[0].item_id; //品目ID ※明細行1番目
    
    //二次元配列を作成
    arr.push([value1,value2,value3,value4,value5,value6]);
    
  }
  
  //二次元配列をスプレッドシートに書き出す
  var i = arr.length; //タテ
  var j = arr[0].length; //ヨコ
  
  //スプレッドシートのA2セルを起点として、配列arrをセットする
  sheet.getRange(2, 1, i, j).setValues(arr);
  
}

/**
 * スプレッドシートのデータからチャットワーク送信用の本文を作成する
 *
 * @param {number} 取引件数
 */
function createBody(total_count) {
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('取引');
  var values = sheet.getRange(2, 1, total_count, 9).getValues();//A列～I列の値を格納
  
  var issue_date,amount,partner,account_item,item;
  var body = '';
  
  for (var i = 0; i < values.length; i++) {
    
    //二次元配列の値を変数に格納
    issue_date = values[i][0]; //発生日
    amount = values[i][2]; //金額
    partner = values[i][6]; //取引先
    account_item = values[i][7]; //勘定科目
    item = values[i][8]; //品目
    
    //パイプライン(|)で結合する
    body += issue_date + ' | ' + partner + ' | ' + amount + ' | ' + account_item + ' | ' + item + '\n';
    
  }
  
  //ヘッダー項目を付与
  var header = '［発生日］ | ［取引先］ | ［金額］ | ［勘定科目］ | ［品目等］\n';
  body = header + body;
  
  //タイトルとtitleタグを付与
  var date = Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd'); //当日日付
  var title = '[title]【会計freee】' + date + 'の入金予定（未入金のみ）[/title]';
  
  //全体をinfoタグで囲む
  body = '[info]' + title + body + '[/info]';

  return body;
  
}

/**
 * チャットワークの指定のルームIDにメッセージを送信する
 * 参照ライブラリ : M6TcEyniCs1xb3sdXFF_FhI-MNonZQ_sT
 *
 * @param {String} 送信するメッセージ
 */
function postChatwork(body) {
  
  var client = ChatWorkClient.factory({token : 'xxxxxxxxxx'}); //APIトークンを指定
  
  client.sendMessage({
    room_id : 'xxxxxxx', //ルームIDを指定
    body : body
  });
  
}
