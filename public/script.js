jQuery(function () {

	var socket = io();
	showLoader();
	socket.emit('start');

	var start = 0;
	var pager = 10;
        var statuses = [];

	// find data
	function find() {
		showLoader();
		var data = {
			start: start,
			pager: pager
		};
		socket.emit('find', data);
	}

	jQuery("#btn_reset").click(function () {
		start = 0;
		find();
	});

	jQuery("#btn_previous").click(function () {
		start = start + pager;
		find();
	});
	jQuery("#btn_next").click(function () {
		start = start - pager;
		find();
	});

	// server started
	socket.on('started', function (data) {
		if (validate(data)) {
			jQuery("#btn_reset").click();
		} else {
			loadPage("#error");
		}
	});

	// a new measure is ready, update on real-time
	socket.on('inserted', function (data) {
		if (validate(data) && jQuery("#ckb_realtime").prop("checked")) {
			jQuery("#btn_reset").click();
		}
	});

	// found data to show
	socket.on('found', function (data) {
		if (validate(data) && data.statuses.length > 0
                    && data.values.length > 0) {
			loadPage("#checkin");
                        jQuery("#current_statuses").html("");
                        var html = "";
			data.statuses.forEach(function(v) {
                            if (typeof statuses[v.door] !== "undefined" && statuses[v.door] != v.value) {
                                displayNotification(v);
                            }
                            statuses[v.door] = v.value;
                            var status = (v.value ? 'chiusa' : 'aperta');
                            var icon = (v.value ? 'lock' : 'warning-sign');
                            var alert = (v.value ? 'success' : 'warning');
                            html += '<div class="alert alert-' + alert + '">' +
                                    '<span class="glyphicon glyphicon-' + icon + '" aria-hidden="true"></span> ' +
                                    '<span>door ' + v.door + ' &egrave; ' + status + '</span></div>';
			});
                        jQuery("#current_statuses").html(html);

                        html = "";
			data.values.forEach(function (v) {
                            html += '<li>' + moment(v.time * 1000).locale("IT")
                                    .format('dddd e MMM [alle] HH:mm:ss') +
                                    ' door ' + v.door + ' era ' +
                                    (v.value ? 'chiusa' : 'aperta') + "</li>";
			});
			jQuery("#checkin_data").html(html);
		} else {
			jQuery("#btn_reset").click();
		}
	});

});

// check response validity
function validate(data) {
	return null !== data && 0 === data.code;
}

// show loader
function showLoader() {
	$("#progress").removeClass("hidden");
}

// hide loader
function loadPage(page) {
	$("#progress").addClass("hidden");
	$(".app-panel").addClass("hidden");
	$(page).removeClass("hidden");
}

// show alert message
function showMessage(msg, status) {
	$("#message").html(msg).removeClass("hidden").addClass(status);
	setTimeout(hideMessage, 6000);
}

// hide alert message
function hideMessage() {
	$("#message").html("").removeClass().addClass("alert hidden");
}

// PUSH NOTIFICATIONS
if (Notification) {
	if (Notification.permission === "granted") {
		navigator.serviceWorker.register('sw.js');
	} else if (Notification.permission === "blocked") {
		/* the user has previously denied push. Can't reprompt. */
	} else {
		Notification.requestPermission(function (status) {
			console.log('Notification permission status:', status);
		});
	}
}

function displayNotification(v) {
	if (Notification && navigator.serviceWorker &&
		Notification.permission === "granted") {
		navigator.serviceWorker.ready.then(function (registration) {
			registration.showNotification('DOOR GUARDIAN', {
				body: moment(v.time * 1000).locale("IT")
					.format('dddd e MMM [alle] HH:mm:ss') +
					' stato door ' + v.door + ' -> ' +
					(v.value ? 'chiusa' : 'aperta'),
				vibrate: [200, 100, 200, 100, 200],
			});
		});
	}
}
