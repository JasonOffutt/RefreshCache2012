(function () {
	'use strict';

	// Create an event aggregator object to handle cross-class communication
	var Events = _.extend({}, Backbone.Events),

	// class definition to represent individual "Videos" from Vimeo's API
		Video = Backbone.Model.extend({
			initialize: function (options) {
				this.set({ htmlId: 'video_' + this.get('id') }, { silent: true });
			}
		}),

	// Collection of "Video" models to represent the full feed of data from Vimeo
		VideoCollection = Backbone.Collection.extend({
			model: Video,
			comparator: function (video) {
				return video.get('id');
			}
		}),

	// View object to handle UI logic concerns. Represents the list of videos.
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

	// View object to handle UI for an individual video.
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
				Events.trigger('message:index');
				return false;
			}
		}),

	// Router object that can act as a "Controller" of sorts ***. Handles
	// URL routing.
		MessageRouter = Backbone.Router.extend({
			routes: {
				'message/:id': 'message',
				'latest': 'latest',
				'*options': 'index'	// Well-known backbone catch-all route
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
				this.navigate('', true);
			},
			message: function (id) {
				var video = this.model.get(id),
					view = new MessageView({ model: video });
				view.render();
				this.navigate('message/' + id, true);
			},
			latest: function () {
				var video = this.model.at(0),
					view = new MessageView({ model: video });
				view.render();
				this.navigate('latest', true);
			}
		});

	// Wire up application in here...
		$(function () {
			$.getJSON('http://vimeo.com/api/v2/centralaz/videos.json?callback=?', function (data) {
				var videoCollection = new VideoCollection(data),
					router = new MessageRouter({ model: videoCollection });
				Backbone.history.start();
			});
		});
}());