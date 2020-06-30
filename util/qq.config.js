module.exports = {
    'code_path': 'https://graph.qq.com/oauth2.0/authorize',
    'access_token_path': 'https://graph.qq.com/oauth2.0/token',
    'openid_path': 'https://graph.qq.com/oauth2.0/me',
    'user_info_path':'https://graph.qq.com/user/get_user_info',
    'redirect_uri':'http://api.qianyaru.cn/githubLogin', // 登录回调
    'client_id': '', // qq互联应用appid
    'client_secret': '', // qq互联应用APP Key
    'scope': ['get_user_info','get_vip_info','get_vip_rich_info'],
};