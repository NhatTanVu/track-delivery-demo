package DispoSell.Demo.TrackDelivery;

public class MapContent {
    private Position startPosition;
    private Position endPosition;
    private String sessionId;

    public MapContent(Position startPosition, Position endPosition, String sessionId) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.sessionId = sessionId;
    }

    public Position getStartPosition() {
        return startPosition;
    }

    public void setStartPosition(Position startPosition) {
        this.startPosition = startPosition;
    }

    public Position getEndPosition() {
        return endPosition;
    }

    public void setEndPosition(Position endPosition) {
        this.endPosition = endPosition;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
