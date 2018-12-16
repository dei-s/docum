var app = new Vue({
	el: '#app',
	data: {
		message: '',
		pinnedMessage: {},
		messages: [],
		wall: '3N9Fige8uU547yEAy8vYCWSwyCfHZt3orNL', // mir
		node: 'https://testnode1.wavesnodes.com',
		amount: '0.001',
		fee: '0.001',
		minAmount: 1,
		pinAmount: 1000000,
		last: 0
	},
	created: function() {
		this.update();
		setInterval(this.update, 1000);
	},
	methods: {
		formatSender: function(sender) {
			return '...' + sender.slice(-7);
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		loadPosts: async function(limit) {
			let response = await axios.get(this.node + '/transactions/address/' + this.wall + '/limit/' + limit);
			return response.data;
		},
		findByKey: function(array, id) {
			let element = array.find(element => {
				return element.key == id ? element : false;
			});
			return element;
		},
		getName: async function(sender) {
			try {
				let response = await axios.get(this.node + '/addresses/data/' + sender + '/waves-wall-name');
				return response.data ? response.data : '';
			} catch(err) {
				console.log(err);
				return '';
			}
		},
		update: async function() {
			let lastTx = await this.loadPosts(1);
			let lastTime = lastTx[0][0].timestamp;
			if (lastTime != this.last) {
				let data = await this.loadPosts(10000);
				this.messages = [];
				await data[0].forEach(item => {
					if (item.attachment && item.amount >= this.minAmount && item.assetId == 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ') {
						let msg = this.decode(item.attachment);
						this.messages.unshift({
							sender: item.sender,
							text: msg,
							time: item.timestamp,
							amount: item.amount,
							id: item.id
						});
						let pinned = this.messages.find(element => {
							return element.amount > this.pinAmount ? element : false;
						});
						this.pinnedMessage = pinned ? pinned : '';
					}
				});
				this.$refs.msgWrapper.scrollTop = this.$refs.msgWrapper.scrollHeight;
				this.last = lastTime.valueOf();
			}
		},
		findMax: function(arr) {
			return arr.reduce(function(prev, curr){
				return prev.amount >= curr.amount ? prev : curr;
			});
		},
		decode: function(text) {
			let bytes = Base58.decode(text);
			let str = '';
			for (let i = 0; i < bytes.length; i++) {
				str += String.fromCharCode(bytes[i]);
			}
			return decodeURIComponent(escape(str));
		},
		send: async function() {
			let msg = this.message;
			let params = {
				type: 4,
				data: {
					amount: {
						assetId: 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ',
						tokens: this.amount
					},
					fee: {
						assetId: 'WAVES',
						tokens: this.fee
					},
					recipient: this.wall,
					attachment: msg
				}
			}
			if (this.checkKeeper()) {
				try {
					let res = await window.Waves.signAndPublishTransaction(params);
					this.message = '';
				} catch (err) {
					alert(err.message);
				}
			} else {
				alert('Please, install Waves Keeper.\nFollow the link at the bottom of the page.');
			}
		},
		checkKeeper: function() {
			return typeof window.Waves !== 'undefined';
		}
	}
});
