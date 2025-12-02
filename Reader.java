import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

public class Reader {
    public static void main(String[] args) {
        try {
            byte[] bytes = Files.readAllBytes(Paths.get(args[0]));
            String content = new String(bytes, StandardCharsets.UTF_8);
            System.out.println(content);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
