package proyectois.cupcakes.resources;
import io.github.cdimascio.dotenv.Dotenv;
import java.sql.Connection;
import java.sql.DriverManager;

//comentario prueba
public class Conexionbd 
{
 private static Dotenv dotenv = Dotenv.load();
        

   
    public static Connection getConexion()
    {
      

       try
       {
           
       
          String url= dotenv.get("urlbd");
          String user = dotenv.get("userbd");
          String password = dotenv.get("pwbd");
          return DriverManager.getConnection(url, user, password);

           
       }
       catch(Exception e)
       {
         System.err.println("Error: " + e.getMessage());
         return null;
       }
       
        
    }
}
