(function () {
  
  let recetasLocales = []; 
  

  const estado = document.getElementById("recetario-estado");
  const galeria = document.getElementById("galeria-recetas");
  const formulario = document.getElementById("formulario-filtros");
  const btnRestablecer = document.getElementById("btn-restablecer");

  
  function renderizarGaleria(recetas) {
    galeria.innerHTML = ""; 

    if (recetas.length === 0) {
      
      estado.textContent = "No se encontraron recetas que coincidan con los filtros aplicados.";
      estado.classList.remove("oculto");
    } else {
      estado.classList.add("oculto");
      recetas.forEach(receta => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-receta";
        tarjeta.innerHTML = `
          <h3>${receta.nombreReceta}</h3>
          <div class="tarjeta-detalles">
            <span class="badge">⏱ ${receta.minutos} min</span>
            <span class="badge">👥 ${receta.porciones} porciones</span>
          </div>
        `;
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
    
    
    const nombreRecetaMinusculas = receta.nombreReceta.toLowerCase();
    const pasaNombre = textoBusqueda === "" || nombreRecetaMinusculas.includes(textoBusqueda);

    return pasaTiempo && pasaPorciones && pasaNombre;
  });

  renderizarGaleria(recetasFiltradas);
}


document.getElementById("formulario-filtros").addEventListener("input", aplicarFiltros);
  
  function restablecer() {
    formulario.reset(); 
    renderizarGaleria(recetasLocales); 
  }


  async function iniciarRecetario() {
    if (!estado) return;

    try {
      recetasLocales = await window.recetarioServicio.listarTodos();
      
      
      renderizarGaleria(recetasLocales);
      
      
      formulario.addEventListener("change", aplicarFiltros);
      btnRestablecer.addEventListener("click", restablecer);
      
    } catch (error) {
      estado.classList.remove("oculto");
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base del recetario.";
      console.error(error);
    }
  }

  

  document.addEventListener("DOMContentLoaded", iniciarRecetario);
})();
