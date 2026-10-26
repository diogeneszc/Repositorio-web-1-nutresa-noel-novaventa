(function () {
  let recetasLocales = []; 
  
  const estado = document.getElementById("recetario-estado");
  const galeria = document.getElementById("galeria-recetas");
  const formulario = document.getElementById("formulario-filtros");
  const btnRestablecer = document.getElementById("btn-restablecer");

  
  const vistaDetalle = document.getElementById("vista-detalle");
  const detalleContenido = document.getElementById("detalle-contenido");
  const btnVolver = document.getElementById("btn-volver");

  
  async function abrirDetalle(receta) {
    
    formulario.classList.add("oculto");
    galeria.classList.add("oculto");
    vistaDetalle.classList.remove("oculto");
    
    detalleContenido.innerHTML = `<p>Cargando ingredientes de <strong>${receta.nombreReceta}</strong>...</p>`;

    
    const ingredientes = await window.recetarioServicio.obtenerIngredientes(receta.idReceta);

    
    let htmlTabla = `
      <h2>${receta.nombreReceta}</h2>
      <table class="receta-ingredientes-lista">
        <caption>Ingredientes necesarios para la preparación</caption>
        <thead>
          <tr>
            <th scope="col">Producto Nutresa</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Unidad</th>
          </tr>
        </thead>
        <tbody>
    `;

    
    ingredientes.forEach(ingrediente => {
      
      const cantidadFormateada = new Intl.NumberFormat('es-CO').format(ingrediente.cantidad);

      htmlTabla += `
        <tr>
          <td>${ingrediente.nombreProducto}</td>
          <td>${cantidadFormateada}</td>
          <td>${ingrediente.unidad}</td>
        </tr>
      `;
    });

    htmlTabla += `
        </tbody>
      </table>
    `;

    
    detalleContenido.innerHTML = htmlTabla;
  }

  
  function cerrarDetalle() {
    vistaDetalle.classList.add("oculto"); 
    formulario.classList.remove("oculto"); 
    galeria.classList.remove("oculto"); 
  }

  function renderizarGaleria(recetas) {
    galeria.innerHTML = ""; 

    if (recetas.length === 0) {
      estado.textContent = "No se encontraron recetas.";
      estado.classList.remove("oculto");
    } else {
      estado.classList.add("oculto"); 
      
      recetas.forEach(receta => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-receta";
        tarjeta.style.cursor = "pointer"; 
        
        tarjeta.innerHTML = `
          <h3>${receta.nombre}</h3>
          <div class="tarjeta-detalles">
            <span class="badge">⏱ ${receta.cantidad} min</span>
            <span class="badge">👥 ${receta.fecha_vencimieto} porciones</span>
          </div>
        `;

        tarjeta.addEventListener("click", function() {
          abrirDetalle(receta); 
        });

        galeria.appendChild(tarjeta);
      });
    }
  }

  function aplicarFiltros() {
    const tiempoSeleccionado = document.getElementById("filtro-tiempo").value;
    const porcionesSeleccionadas = document.getElementById("filtro-porciones").value;
    const textoBusqueda = document.getElementById("filtro-nombre").value.toLowerCase();

    const recetasFiltradas = recetasLocales.filter(receta => {
      const pasaTiempo = tiempoSeleccionado === "todos" || receta.minutos <= parseInt(tiempoSeleccionado, 10);
      const pasaPorciones = porcionesSeleccionadas === "todas" || receta.porciones === parseInt(porcionesSeleccionadas, 10);
      const pasaNombre = textoBusqueda === "" || receta.nombreReceta.toLowerCase().includes(textoBusqueda);
      return pasaTiempo && pasaPorciones && pasaNombre;
    });

    renderizarGaleria(recetasFiltradas);
  }

  function restablecer() {
    formulario.reset(); 
    renderizarGaleria(recetasLocales); 
  }

  async function iniciarRecetario() {
    if (!estado) return;

    try {
      recetasLocales = await window.recetarioServicio.listarTodos();
      renderizarGaleria(recetasLocales);
      
      formulario.addEventListener("input", aplicarFiltros);
      formulario.addEventListener("change", aplicarFiltros);
      btnRestablecer.addEventListener("click", restablecer);
      
      
      btnVolver.addEventListener("click", cerrarDetalle);
      
    } catch (error) {
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarRecetario);
})();