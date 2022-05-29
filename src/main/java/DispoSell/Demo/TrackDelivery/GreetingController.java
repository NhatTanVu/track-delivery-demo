package DispoSell.Demo.TrackDelivery;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class GreetingController {

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Position greeting(Position message) throws Exception {
        Thread.sleep(1000); // simulated delay
        return message;
    }
}
