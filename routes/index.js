/*
*所有的路由接口
*/
const user = require('./user');
const article = require('./article');
const about = require('./about');
const comment = require('./comment');
const message = require('./message');
const MessageBoard = require('./messageBoard');
const tag = require('./tag');
const link = require('./link');
const category = require('./category');
const timeAxis = require('./timeAxis');
const project = require('./project');
const statistics = require('./statistics');
const album = require('./album');
const photo = require('./photo');

module.exports = app => {
	/**
	 * 用户相关api
	 */
	app.get('/', (req,res)=>{
		res.render('index', { title: 'Khari接口', data: '欢迎访问Khari-blog的api界面' });
	});
	app.post('/login', user.login);
	app.post('/logout', user.logout);
	app.post('/loginAdmin', user.loginAdmin);
	app.post('/register', user.register);
	app.post('/addUser', user.addUser);
	app.post('/updateUser',user.updateUser);
	app.post('/delUser', user.delUser);
	app.get('/currentUser', user.currentUser);
	app.get('/getUserList', user.getUserList);
	app.get('/githubLogin',user.githubLogin);
	app.get('/githubUserInfo',user.githubUserInfo);
	app.get('/qqLogin',user.qqLogin);
	app.post('/queryQqLoginUserInfo',user.queryQqLoginUserInfo);
	app.get('/sendEmailCode',user.sendEmailCode);
	/**
	 * 关于我们相关api
	 */
	app.post('/addAbout',about.addAboutContent);
	app.post('/updateAbout',about.updateAboutContent);
	app.post('/deleteAbout',about.deleteAbout);
	app.get('/getAboutList',about.getAboutList);
	app.get('/getAboutContent',about.getAboutContent);
	app.get('/getAboutDetail',about.getAboutDetail);

	/**
	 * 文章评论相关api
	 */
	app.post('/addComment', comment.addComment);
	app.post('/addThirdComment', comment.addThirdComment);
	app.post('/changeComment', comment.changeComment);
	app.post('/changeThirdComment', comment.changeThirdComment);
	app.get('/getCommentList', comment.getCommentList);

	/**
	 * 文章相关api
	 */
	app.post('/addArticle', article.addArticle);
	app.post('/uploadImgLocal', article.uploadImgLocal);
	app.post('/uploadImg', article.uploadImg);
	app.post('/updateArticle', article.updateArticle);
	app.post('/delArticle', article.delArticle);
	app.get('/getArticleList', article.getArticleList);
	app.get('/getHotArticleList', article.getHotArticleList);
	app.get('/getArticleListAdmin', article.getArticleListAdmin);
	app.post('/getArticleDetail', article.getArticleDetail);
	app.post('/likeArticle', article.likeArticle);
	
	/**
	 * 标签相关api
	 */
	app.post('/addTag', tag.addTag);
	app.post('/delTag', tag.delTag);
	app.get('/getTagList', tag.getTagList);

	/**
	 * 分类相关api
	 */
	app.post('/addCategory', category.addCategory);
	app.post('/delCategory', category.delCategory);
	app.get('/getCategoryList', category.getCategoryList);

	/**
	 * 旧版留言板相关api
	 */
	app.post('/addMessage', message.addMessage);
	app.post('/addReplyMessage', message.addReplyMessage);
	app.post('/delMessage', message.delMessage);
	app.post('/getMessageDetail', message.getMessageDetail);
	app.get('/getMessageList', message.getMessageList);

	/**
	 * 新版留言板相关api
	 */
	app.get('/getMessageBoardList',MessageBoard.getMessageBoardList);
	app.get('/getMessageBoardListAdmin',MessageBoard.getMessageBoardListAdmin);
	app.get('/getMessageBoardDetail',MessageBoard.getMessageBoardDetail);
	app.post('/addMessageBoard',MessageBoard.addMessageBoard);
	app.post('/updateMessageBoard',MessageBoard.updateMessageBoard);
	
	/**
	 * 友情链接相关api
	 */
	app.post('/addLink', link.addLink);
	app.post('/updateLink', link.updateLink);
	app.post('/delLink', link.delLink);
	app.get('/getLinkList', link.getLinkList);
	app.get('/getAllLinkList', link.getAllLinkList);
	
	/**
	 * 时间轴相关api
	 */
	app.post('/addTimeAxis', timeAxis.addTimeAxis);
	app.post('/updateTimeAxis', timeAxis.updateTimeAxis);
	app.post('/delTimeAxis', timeAxis.delTimeAxis);
	app.get('/getTimeAxisList', timeAxis.getTimeAxisList);
	app.post('/getTimeAxisDetail', timeAxis.getTimeAxisDetail);

	/**
	 * 项目相关api
	 */
	app.post('/addProject', project.addProject);
	app.post('/updateProject', project.updateProject);
	app.post('/delProject', project.delProject);
	app.get('/getProjectList', project.getProjectList);
	app.post('/getProjectDetail', project.getProjectDetail);

	/**
	 * 统计相关api
	 */
	app.post('/addVisit',statistics.addVisit);
	app.get('/getSiteData',statistics.getSiteData);

	/**
	 * 相册相关api
	 */
	app.post('/addAlbum',album.addAlbum);
	app.post('/updateAlbum',album.updateAlbum);
	app.post('/deleteAlbum',album.deleteAlbum);
	app.get('/getAlbumList',album.getAlbumList);
	app.get('/getAlbumById',album.getAlbumById);
	app.get('/getAlbumIdByName',album.getAlbumIdByName);
	app.post('/addPhoto',photo.addPhoto);
	app.post('/updatePhoto',photo.updatePhoto);
	app.post('/deletePhoto',photo.deletePhoto);
	app.post('/deletePhotoByAlbum',photo.deletePhotoByAlbum);
	app.get('/getPhotoList',photo.getPhotoList);
};
