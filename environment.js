/**
 * Environment module.
 * @file Environment 环境配置
 * @module environment
 * @author kangheng <https://github.com/sun0207>
 */

const environment = process.env.NODE_ENV;
const isDevMode = Object.is(environment, 'development');
const isProdMode = Object.is(environment, 'production');

module.exports = {
	isDevMode,
	isProdMode,
	environment,
};
