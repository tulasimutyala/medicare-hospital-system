
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.io.Console;

public class BCryptGenerator {
    public static void main(String[] args) {
        Console console = System.console();

        if (console == null) {
            System.out.println("Run this program directly in CMD.");
            return;
        }

        char[] passwordChars = console.readPassword("Enter doctor password: ");
        String password = new String(passwordChars);

        if (password.length() < 8 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            System.out.println("Password must be 8–72 UTF-8 bytes.");
            return;
        }

        System.out.println("BCrypt hash:");
        System.out.println(new BCryptPasswordEncoder().encode(password));
        java.util.Arrays.fill(passwordChars, '\0');
    }
}
