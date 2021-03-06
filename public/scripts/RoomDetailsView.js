this.RoomDetailsView = (function(){

	var CONTROL_PROTOCOL_TO_MANUFACTURER = {
		'TANDBERG_SSH'              : 'Cisco',
		'TANDBERG_HTTP'             : 'Cisco',
		'CISCO_IX_SSH_SOAP'         : 'Cisco',
		'POLYCOM_TELNET'            : 'Polycom',
		'POLYCOM_HTTP_HDX'          : 'Polycom',
		'POLYCOM_HTTP_REALPRESENCE' : 'Polycom',
		'LIFESIZE_SSH'              : 'Lifesize',
		'LIFESIZE_HTTP_ICON'        : 'Lifesize',
		'STARLEAF_HTTP'             : 'StarLeaf',
		'TELY_HTTP'                 : 'Tely'
	};

	var RoomDetailsView = Backbone.View.extend({

		className: "roomDetailsView detailsView",

		initialize: function(){
			_.bindAll(this);

			this.els = {};

			data.endpoints.on('status', this.onStatusUpdate);
		},

		render: function(){
			if(this.$el.is(':empty')){
				this.els.photo = $('<img>', { class: 'photo' });
				this.els.name  = $('<h2>',  { class: 'name' });

				this.$el.append(this.els.photo);
				this.$el.append(this.els.name);

				this.els.endpointManufacturer = $('<dd>');
				this.els.endpointIpAddress = $('<dd>');
				this.els.seatingCapacity = $('<dd>');
				this.els.availabilityStatus = $('<dd>').append([
					$('<span>', { "class": "statusBadge" }),
					$('<span>', { "class": "statusLabel" })
				]);

				var dl = $('<dl>');

				dl.append($('<dt>', { text: 'Status' }));
				dl.append(this.els.availabilityStatus);

				dl.append($('<dt>', { text: 'Capacity'} ));
				dl.append(this.els.seatingCapacity);

				dl.append($('<dt>', { text: 'Endpoint' }));
				dl.append(this.els.endpointManufacturer);

				dl.append($('<dt>', { text: 'IP Address' }));
				dl.append(this.els.endpointIpAddress);

				this.$el.append(dl);
			}

			if(this.model){
				this.els.photo.attr('src', config.mountPoint + '/endpoints/'+this.model.id+'/photo'); //causes flickering in Opera

				this.els.name.text(this.model.get('name'));

				this.els.endpointManufacturer.text(this.getManufacturerLabel(this.model.get('controlProtocol')));

				this.els.endpointIpAddress.empty().append($("<a>", {
					text: this.model.get('ipAddress'),
					href: "http://"+this.model.get('ipAddress'),
					target: '_blank'
				}));

				var seatingCapacity = this.model.get('seatingCapacity');
				this.els.seatingCapacity.text(seatingCapacity);
				this.els.seatingCapacity.prev().addBack().toggle(!!seatingCapacity);

				this.renderStatus();

				this.$el.show();
			} else {
				this.$el.hide();
			}

			return this.el;
		},

		renderStatus: function(){
			if(this.model.get('status')){
				this.els.availabilityStatus.find('.statusLabel').text(this.getStatusLabel());
				this.els.availabilityStatus.find('.statusBadge').toggleClass('busy', this.isBusy());
				this.els.availabilityStatus.show();
			} else {
				this.els.availabilityStatus.hide();
			}
		},

		onStatusUpdate: function(endpoint, status){
			if(this.model && (endpoint.id == this.model.id)){
				this.renderStatus();
			}
		},

		getManufacturerLabel: function(){
			return CONTROL_PROTOCOL_TO_MANUFACTURER[this.model.get('controlProtocol')] || "other";
		},

		getStatusLabel: function(){
			if(this.model.get('status').callActive){
				return "in a call";
			} else if(this.model.get('status').reserved){
				return "reserved";
			} else {
				return "available";
			}
		},

		isBusy: function(){
			var endpointStatus = this.model.get('status');
			return endpointStatus.callActive || endpointStatus.reserved;
		}

	});

	return RoomDetailsView;

})();
