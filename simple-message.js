/*global document, window*/


/*
 * remove class
 */

function removeClass(o, c) {
    var re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g');
    o.className = o.className.replace(re, '$1').replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
}


/*
 * recursive merge of two object
 */

function merge(object, override) {
	for (var key in override) {
		if (override.hasOwnProperty(key)) {
			if (override[key] && override[key].constructor && override[key].constructor === Object) {
				merge(object[key] = object[key] || {}, override[key]);
			} else {
				object[key] = override[key];
			}
		}
	}
	return object;
}


/*
 * create a tag with attributes
 */

function make(tag, attrs) {
	var node = document.createElement(tag), key;

	for (key in attrs) {
		if (attrs.hasOwnProperty(key)) {
			node.setAttribute(key, attrs[key]);
		}
	}

	return node;
}


/*
 * constructure if messages
 */

var Message = {

	options: {
		messageHolderId: 'messageHolder'
	},

	queue: [],

	show: function (options) {
		var msg;
		Message.init(options);

		msg = new MessageItem(options).show();
		this.queue.push(msg);
	},

	init: function () {
		var message_holder = document.getElementById(Message.options.messageHolderId);

		if (!message_holder) {
			message_holder = make('ul', {'id': Message.options.messageHolderId});
			document.body.appendChild(message_holder);
		}
	},

};


/*
 * object of message
 */

var MessageItem = function (options) {

	this.defaults = {
		type: 'success',
		title: '',
		messageText: '',
		closeDelay: 0,
		activeClass: '',
		timeout: false,
		templateFunction: false,
		template: {
			wrapper: {
				tag: 'div',
				class: 'message-wrap'
			},
			title: {
				tag: 'h3',
				class: 'title'
			},
			content: {
				tag: 'div',
				class: 'content'
			},
		}
	};

	this.options = merge(this.defaults, options);
	return this;
};

MessageItem.prototype.show = function () {
	var self = this;

	self.options.message = make('li', {'class': 'message-item'});
	self.options.message.innerHTML = self.render(self.options);

	self.options.message_holder = document.getElementById(Message.options.messageHolderId);
	self.options.message_holder.appendChild(self.options.message);

	if (self.options.activeClass) {
		window.setTimeout(function () {
			self.options.message.className = self.options.message.className + ' ' + self.options.activeClass;
		}, 0);
	}

	self.options.message.onclick = function () {
		self.close();
	};

	if (self.options.timeout) {
		window.setTimeout(function () {
			self.close();
		}, self.options.timeout);
	}
	return this;
};

MessageItem.prototype.close = function () {
	var self = this;

	if (self.options.closed) {
		return true;
	}

	self.options.closed = true;

	removeClass(self.options.message, self.options.activeClass);

	window.setTimeout(function () {
		self.options.message_holder.removeChild(self.options.message);

		if (self.options.message_holder.getElementsByTagName('li').length === 0) {
			document.body.removeChild(self.options.message_holder);
		}
	}, self.options.closeDelay);
};


/*
 * message render with default template or custom templateFuntion from option
 */

MessageItem.prototype.render = function (option) {
	var title, content, wrapper, template;

	if (this.options.templateFuntion && typeof this.options.templateFuntion === 'function') {
		return this.options.templateFuntion(option);
	}
	template = option.template;

	wrapper = make(template.wrapper.tag, {'class': template.wrapper.class});

	if (option.title) {
		title = make(template.title.tag, {'class': template.title.class});
		title.innerHTML = option.title;

		wrapper.innerHTML = title.outerHTML;
	}
	if (option.messageText) {
		content = make(template.content.tag, {'class': template.content.class});
		content.innerHTML = option.messageText;

		wrapper.innerHTML = wrapper.innerHTML + content.outerHTML;
	}
	return wrapper.outerHTML;
};
