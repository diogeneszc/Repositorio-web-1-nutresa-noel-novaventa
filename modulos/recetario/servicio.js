(function () {
  // Si api.config.js ya define una URL base, úsala aquí en lugar de esta
  const URL_BASE = "https://6ada657f7512f497b3ffe9aa.mockapi.io/api/v1";
  const RECURSO = "/producto"; // cambia a la ruta de recetas cuando exista

  // Función genérica: valida el estado HTTP y devuelve el JSON
  async function peticion(ruta, opciones) {
    const respuesta = await fetch(URL_BASE + ruta, opciones);

    if (!respuesta.ok) {
      throw new Error("Error de red: " + respuesta.status);
    }
    return respuesta.json();
  }

  function opcionesJSON(metodo, cuerpo) {
    return {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    };
  }

  window.recetarioServicio = {
    // GET /producto
    async listarTodos() {
      return peticion(RECURSO);
    },

    // GET /producto/:id  (para editar una receta existente con sus pasos)
    async obtenerPorId(id) {
      return peticion(RECURSO + "/" + encodeURIComponent(id));
    },

    // POST /producto  (receta nueva; incluye el arreglo `pasos` numerado)
    async crear(receta) {
      return peticion(RECURSO, opcionesJSON("POST", receta));
    },

    // PUT /producto/:id  (receta existente)
    async actualizar(id, receta) {
      return peticion(RECURSO + "/" + encodeURIComponent(id), opcionesJSON("PUT", receta));
    }
  };
})();
