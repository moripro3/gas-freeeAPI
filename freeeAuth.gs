/*
参照ライブラリ(OAuth2)
project_key 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
*/
 
//連携アプリ情報
var Client_ID = 'ここにClient_IDを指定';
var Client_Secret = 'ここにClient_Secretを指定';

function Auth() {
  
  //freeeAPIのサービスを取得
  var service = getService();
  
  //スクリプトへのアクセスを許可する認証URLを取得
  var authUrl = service.getAuthorizationUrl();
  
  Logger.log(authUrl);
  //認証用のURLがログ出力されます。
  //URLをコピーしてブラウザのアドレスバーに貼り付けてアクセスしてください。
}

//freeeAPIのサービスを取得する関数
function getService() {
  return OAuth2.createService('freee')
      .setAuthorizationBaseUrl('https://accounts.secure.freee.co.jp/public_api/authorize')
      .setTokenUrl('https://accounts.secure.freee.co.jp/public_api/token')
      .setClientId(Client_ID)
      .setClientSecret(Client_Secret)
      .setCallbackFunction('authCallback')
      .setPropertyStore(PropertiesService.getUserProperties())
}
 
//認証コールバック関数
function authCallback(request) {
  Logger.log(request);
  var service = getService();
  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('認証に成功しました。タブを閉じてください。');
  } else {
    return HtmlService.createHtmlOutput('認証に失敗しました。');
  };
}