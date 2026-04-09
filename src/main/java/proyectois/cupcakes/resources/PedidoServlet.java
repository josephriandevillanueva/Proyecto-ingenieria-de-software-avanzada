package proyectois.cupcakes.resources;

import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.*;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/procesar-pedido")
public class PedidoServlet extends HttpServlet 
{

    
    private class OrdenRequest 
    {
        ClienteData cliente;
        List<ProductoData> productos;
        double total;
    }
    private class ClienteData 
    {
        String nombre, apPaterno, apMaterno, email, calle, colonia, ciudad;
        int numExterior, numInterior;
    }
    private class ProductoData 
    {
        int id; // id pastelillo
        int cantidad;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        // 1. Leer JSON usando Gson
        Gson gson = new Gson();
        BufferedReader reader = request.getReader();
        OrdenRequest orden = gson.fromJson(reader, OrdenRequest.class);

        Connection con = null;
        try {
            con = Conexionbd.getConexion();
            
            con.setAutoCommit(false);

            
            String sqlPedido = "INSERT INTO pedido " +
                "(nombre, email, direccion_cliente, fecha_pedido, total_pagado, estado) " +
                "VALUES (ROW(?, ?, ?), ?, ROW(?, ?, ?, ?, ?), NOW(), ?, 'PENDIENTE')";

            PreparedStatement psPedido = con.prepareStatement(sqlPedido, Statement.RETURN_GENERATED_KEYS);
            
            
            psPedido.setString(1, orden.cliente.nombre);
            psPedido.setString(2, orden.cliente.apPaterno);
            psPedido.setString(3, orden.cliente.apMaterno);
            
            
            psPedido.setString(4, orden.cliente.email);
            
           
            psPedido.setString(5, orden.cliente.calle);
            psPedido.setInt(6, orden.cliente.numExterior);
            psPedido.setInt(7, orden.cliente.numInterior);
            psPedido.setString(8, orden.cliente.colonia);
            psPedido.setString(9, orden.cliente.ciudad);
            
       
            psPedido.setDouble(10, orden.total);
            
            psPedido.executeUpdate();

           
            ResultSet rs = psPedido.getGeneratedKeys();
            int idPedido = 0;
            if (rs.next()) {
                idPedido = rs.getInt(1);
            }

           
            String sqlDetalle = "INSERT INTO detalles_pedido (r_pedido, pastelito, cantidad) VALUES (?, ?, ?)";
            PreparedStatement psDetalle = con.prepareStatement(sqlDetalle);

            for (ProductoData prod : orden.productos)
            {
                psDetalle.setInt(1, idPedido); 
                psDetalle.setInt(2, prod.id);  
                psDetalle.setInt(3, prod.cantidad);
                psDetalle.addBatch();
            }
            psDetalle.executeBatch(); 

           
            con.commit();
            
            response.getWriter().write("{\"status\":\"exito\", \"mensaje\":\"Pedido #" + idPedido + " guardado.\"}");

        } catch (Exception e) 
        {
            e.printStackTrace();
            try 
            { if (con != null) con.rollback(); 
            } catch (SQLException ex) {} // Deshacer si falla
            response.getWriter().write("{\"status\":\"error\", \"mensaje\":\"" + e.getMessage() + "\"}");
        } finally 
        {
            try
             { if (con != null) con.close(); 
            } catch (SQLException e) {}
        }
    }
}