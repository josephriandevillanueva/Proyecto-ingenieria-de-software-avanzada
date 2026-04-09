
function agregarAlCarrito(id, nombre, precio) 

{
    const imagenElemento = document.getElementById('img-' + id);
    
    
    const imagenSrc = imagenElemento ? imagenElemento.src : '';
    
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    
    const existente = carrito.find(item => item.id === id);

    if (existente) 
    {
        existente.cantidad++;
    } else 

    {
       
        carrito.push({ id:id, nombre:nombre, precio:precio, imagen:imagenSrc, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`¡${nombre} añadido al carrito!`);
}

function cargarCarrito() 
{
    const contenedor = document.getElementById('lista-carrito');
    const textoVacio = document.getElementById('mensaje-vacio');
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) 
    {
        if(contenedor) contenedor.innerHTML = '';
        if(textoVacio) textoVacio.style.display = 'block';
        return;
    }

    if(textoVacio) textoVacio.style.display = 'none';
    
    let html = '';
    let total = 0;

    carrito.forEach((prod, index) => {
        let subtotal = prod.precio * prod.cantidad;
        total += subtotal;
        
        html += `
            <div class="flex justify-between items-center border-b py-4">
                <div class="flex items-center">
                    <img src="${prod.imagen}" class="w-16 h-16 rounded-md object-cover mr-4">
                    <div>
                        <h4 class="font-bold text-purple-900">${prod.nombre}</h4>
                        <p class="text-sm text-gray-600">$${prod.precio} x ${prod.cantidad}</p>
                    </div>
                </div>
                <span class="font-bold text-purple-700">$${subtotal.toFixed(2)}</span>
                <button onclick="eliminarItem(${index})" class="text-red-500 text-sm ml-4">Eliminar</button>
            </div>
        `;
    });

    
    if (total > 0) 
    {
       
        html += `
            <div class="mt-6 text-center">
                <p class="text-xl font-bold text-purple-900 mb-4">Total: $${total.toFixed(2)}</p>
                <a href="pago.html" class="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition">Proceder al Pago</a>
            </div>
        `;
    }

    if(contenedor) contenedor.innerHTML = html;
}

function eliminarItem(index) 
{
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito(); 
}


function prepararPago() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const displayTotal = document.getElementById('display-total-pago');
    
    if (carrito.length > 0) 
    {
        let total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        if(displayTotal) displayTotal.innerText = `$${total.toFixed(2)}`;
    }
}


function enviarPedidoCompleto() 
{
    let carrito = JSON.parse(localStorage.getItem('carrito'));

    if (!carrito || carrito.length === 0) 
    {
        alert("El carrito está vacío");
        return;
    }

    
    let cliente = 
    {
        nombre: document.getElementById("nombre").value,
        apPaterno: document.getElementById("apPaterno").value,
        apMaterno: document.getElementById("apMaterno").value,
        email: document.getElementById("email").value,
        calle: document.getElementById("calle").value,
        numExterior: parseInt(document.getElementById("numExterior").value) || 0,
        numInterior: parseInt(document.getElementById("numInterior").value) || 0,
        colonia: document.getElementById("colonia").value,
        ciudad: document.getElementById("ciudad").value
    };

    
    if (!cliente.nombre || !cliente.email || !cliente.calle) 
    {
        alert("Por favor completa los campos obligatorios (Nombre, Email, Calle).");
        return;
    }

    let orden = 
    {
        cliente: cliente,
        productos: carrito, // id y cantidad 
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };

    // Enviamos a Java
    fetch('procesar-pedido', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orden)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === "exito") 
        {
            alert("¡Pedido Exitoso! ID: " + data.mensaje);
            localStorage.removeItem('carrito'); 
            window.location.href = "index.html";
        } else 
        {
            alert("Error en el servidor: " + data.mensaje);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Error al conectar con el servidor Java.");
    });
}

document.addEventListener('DOMContentLoaded', () => {
  
    if (document.getElementById('lista-carrito')) 
    {
        cargarCarrito();
    } 
    
 
    if (document.getElementById('form-pago')) {
        prepararPago();
        
        
        document.getElementById('form-pago').addEventListener('submit', function(e) 
        {
            e.preventDefault(); 
            enviarPedidoCompleto(); 
        });
    }
});