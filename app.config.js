/**
 * App config module.
 * @file 应用运行配置
 * @module app.config
 * @author kangheng <https://github.com/sun0207>
 */

const path = require('path');
const { argv } = require('yargs');
// const package = require('package')

exports.APP = {
	LIMIT: 10,
	PORT: 8000,
	ROOT_PATH: __dirname,
	NAME: 'kangheng',
	URL: 'https://qianyaru.cn/main.html',
	FRONT_END_PATH: path.join(__dirname, '..', 'kangheng'),
};

exports.CROSS_DOMAIN = {
	allowedOrigins: [
		'https://qianyaru.cn/main.html',
		'https://qianyaru.cn',
		'https://github.com/sun0207',
	],
	allowedReferer: 'kangheng',
};

exports.MONGODB = {
	uri: `mongodb://root:qq962464@127.0.0.1:${argv.dbport || '27017'}/blogNode`,
	username: argv.db_username || 'root',
	password: argv.db_password || 'qq962464',
};
exports.AUTH = {
	data: argv.auth_data || { user: 'root' },
	jwtTokenSecret: argv.auth_key || 'blog-node',
	defaultPassword: argv.auth_default_password || 'qq962464',
};

exports.EMAIL = {
	account: argv.email_account || 'your email address like : i@kangheng',
	password: argv.email_password || 'your email password',
	from: 'https://github.com/sun0207',
	admin: 'kangheng',
};

exports.AKISMET = {
	key: argv.akismet_key || 'your akismet Key',
	blog: argv.akismet_blog || 'your akismet blog site, like: https://qianyaru.cn/main.html',
};

exports.GITHUB = {
	username: 'kangheng',
};

exports.ALIYUN = {
	ip: argv.aliyun_ip_auth,
};

exports.BAIDU = {
	site: argv.baidu_site || 'your baidu site domain like : kangheng',
	token: argv.baidu_token || 'your baidu seo push token',
};

exports.QINIU = {
	accessKey: argv.qn_accessKey || 'your access key',
	secretKey: argv.qn_secretKey || 'your secret key',
	bucket: argv.qn_bucket || 'your bucket name',
	origin: argv.qn_origin || 'http://nodepress.u.qiniudn.com',
	uploadURL: argv.qn_uploadURL || 'https://up.qiniu.com/',
};

exports.INFO = {
	// name: package.name,
	// version: package.version,
	// author: package.author,
	// site: exports.APP.URL,
	github: 'https://github.com/sun0207',
	powered: ['react', 'Nodejs', 'MongoDB', 'Express', 'Nginx'],
};
