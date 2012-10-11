(function () {
	'use strict';

	var Events = _.extend({}, Backbone.Events),
		Video = Backbone.Model.extend({
			initialize: function (options) {
				this.set({ htmlId: 'video_' + this.get('id') }, { silent: true });
			}
		}),
		VideoCollection = Backbone.Collection.extend({
			model: Video,
			comparator: function (video) {
				return video.get('id');
			}
		}),
		IndexView = Backbone.View.extend({
			className: 'index',
			tagName: 'ul',
			$template: $('#video-template'),
			events: {
				'click .message': 'messageClicked'
			},
			initialize: function (options) {
				this.model = options.model || {};
				_.bindAll(this);
			},
			render: function () {
				var that = this,
					$container = $('#main');

				this.model.forEach(function (video) {
					var json = video.toJSON(),
						tmp = _.template(that.$template.html(), json);
					that.$el.append(tmp);
				});

				$container.empty().append(this.$el);
				return this;
			},
			messageClicked: function (e) {
				var id = $(e.currentTarget).attr('data-id');
				Events.trigger('message:show', id);
				return false;
			}
		}),
		MessageView = Backbone.View.extend({
			className: 'video',
			tagName: 'article',
			$template: $('#message-template'),
			events: {
				'click .back': 'backClicked'
			},
			initialize: function (options) {
				this.model = options.model || {};
				_.bindAll(this);
			},
			render: function () {
				var $container = $('#main'),
					json = this.model.toJSON(),
					tmp = _.template(this.$template.html(), json);
				this.$el.append(tmp);
				$container.empty().append(this.$el);
				return this;
			},
			backClicked: function (e) {
				Events.trigger('message:index', id);
				return false;
			}
		}),
		MessageRouter = Backbone.Router.extend({
			routes: {
				'message/:id': 'message',
				'latest': 'latest',
				'*options': 'index'
			},
			initialize: function (options) {
				this.model = options.model || [];
				_.bindAll(this);
				Events.on('message:show', this.message);
				Events.on('message:index', this.index);
			},
			index: function () {
				var view = new IndexView({ model: this.model });
				view.render();
			},
			message: function (id) {
				var video = this.model.get(id),
					view = new MessageView({ model: video });
				view.render();
			},
			latest: function () {
				var video = this.model.at(0),
					view = new MessageView({ model: video });
				view.render();
			}
		});

		$(function () {
			$.getJSON('http://vimeo.com/api/v2/centralaz/videos.json?callback=?', function (data) {
				var videoCollection = new VideoCollection(data),
					router = new MessageRouter({ model: videoCollection });
				Backbone.history.start();
			});
		});
}());