let stompClient = null;
let sessionId = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#map").css('visibility', 'visible');
        $("#search-section").css('visibility', 'visible');
    } else {
        $("#map").css('visibility', 'hidden');
        $("#search-section").css('visibility', 'hidden');
    }
}

function connect() {
    const socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        //console.log('Connected: ' + frame);
        sessionId = /\/([^\/]+)\/websocket/.exec(socket._transport.url)[1];
        console.log("sessionId = " + sessionId);
        stompClient.subscribe('/topic/greetings', function (greeting) {
            let mapContent = JSON.parse(greeting.body);
            if (mapContent != null && sessionId != mapContent.sessionId) {
                syncMap(mapContent);
            }
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function notifyChanged(mapContent) {
    if (stompClient !== null && mapContent !== null) {
        mapContent.sessionId = sessionId;
        console.log(mapContent);
        stompClient.send("/app/hello", {}, JSON.stringify(mapContent));
    }
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function () {
        connect();
    });
    $("#disconnect").click(function () {
        disconnect();
    });
});