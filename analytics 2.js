//Analytics     https://www.google.com/analytics/web/
// postmaster.bep@gmail.com
//   viewid
// 128950319
//サービス アカウント ID
//560414460200-97e8kskuc4e6lonrm2llahdbpu84q2di@developer.gserviceaccount.com
//鍵 ID
//  1bbdc8302b48806c692dfea2b365c30f1622d01b
//Adwords       https://adwords.google.co.jp                postmaster.bep@gmail.com    broad4511
//notasecret
//  'dimensions': 'ga:pagePath',
//  'metrics': 'ga:pageviews',
//  'sort': '-ga:pagePath',
//  "start-date": '2017-01-01',
//  "end-date": '2017-06-30',
//    'dimensions': 'ga:medium',
var gaAnalytics = require("ga-analytics");
var CLIENT_ID = '560414460200-97e8kskuc4e6lonrm2llahdbpu84q2di.apps.googleusercontent.com';
var SERVICE_ACCOUNT_EMAIL = '560414460200-97e8kskuc4e6lonrm2llahdbpu84q2di@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = './config/systems/key.pem';
gaAnalytics({
    'dimensions': 'ga:sourceMedium',
    'metrics': 'ga:bounceRate,ga:sessions,ga:users,ga:pageviews,ga:sessionDuration',
    "start-date": 'today',
    "end-date": 'today',
    clientId: CLIENT_ID,
    serviceEmail: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_KEY_FILE,
    ids: "ga:15857470"
}, (err, res) => {
    if (!err) {
        console.log(res.totalsForAllResults);
    }
});
//# sourceMappingURL=analytics 2.js.map