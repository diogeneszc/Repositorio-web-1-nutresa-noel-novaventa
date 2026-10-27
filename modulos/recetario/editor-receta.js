(function () {
  const formulario = document.getElementById("formulario-receta");
  const inputTitulo = document.getElementById("receta-titulo");
  const errorTitulo = document.getElementById("receta-titulo-error");
  const estado = document.getElementById("receta-estado");
  const btnGuardar = formulario.querySelector('button[type="submit"]');

  // Si la URL trae ?id=..., se edita una receta existente; si no, se crea una nueva
  let idReceta = new URLSearchParams(window.location.search).get("id");

  function mostrarEstado(mensaje) {
    estado.textContent = mensaje;
    estado.classList.toggle("oculto", mensaje === "");
  }

  function validarTitulo() {
    const vacio = inputTitulo.value.trim() === "";
    errorTitulo.textContent = vacio ? "El título de la receta es obligatorio." : "";
    errorTitulo.classList.toggle("oculto", !vacio);
    inputTitulo.setAttribute("aria-invalid", vacio ? "true" : "false");
    return !vacio;
  }

  // Arma el objeto final; los pasos ya llegan numerados (1..n) según su orden
  function construirReceta() {
    return {
      título: inputTitulo.value.trim(),
      pasos: window.recetaEditorPasos.obtenerPasos()
    };
  }

  // GET: carga la receta y deja sus pasos en el componente, ordenados por número
  async function cargarReceta() {
    mostrarEstado("Cargando receta...");

    try {
      const receta = await window.recetarioServicio.obtenerPorId(idReceta);
      inputTitulo.value = receta.título || "";

      const descripciones = (receta.pasos || [])
        .slice()
        .sort(function (a, b) { return a.numero - b.numero; })
        .map(function (paso) { return paso.descripcion; });

      window.recetaEditorPasos.iniciar(descripciones);
      mostrarEstado("");
    } catch (error) {
      console.error("Fallo al cargar la receta:", error.message);
      window.recetaEditorPasos.iniciar();
      mostrarEstado("No se pudo cargar la receta. Puedes crear una nueva.");
      idReceta = null;
    }
  }

  // POST (receta nueva) o PUT (receta existente)
  async function guardarReceta(evento) {
    evento.preventDefault();

    const tituloValido = validarTitulo();
    const pasosValidos = window.recetaEditorPasos.validar();

    if (!tituloValido) {
      inputTitulo.focus();
      return;
    }
    if (!pasosValidos) return;

    const receta = construirReceta();
    btnGuardar.disabled = true;
    mostrarEstado("Guardando receta...");

    try {
      if (idReceta) {
        await window.recetarioServicio.actualizar(idReceta, receta);
      } else {
        const creada = await window.recetarioServicio.crear(receta);
        idReceta = creada.id; // los siguientes guardados actualizan, no duplican
      }
      mostrarEstado("");
      alert("Receta guardada con " + receta.pasos.length + " paso(s).");
    } catch (error) {
      console.error("Fallo al guardar la receta:", error.message);
      mostrarEstado("No se pudo guardar la receta. Intenta de nuevo.");
    } finally {
      btnGuardar.disabled = false;
    }
  }

  formulario.addEventListener("submit", guardarReceta);

  if (idReceta) {
    cargarReceta();
  } else {
    window.recetaEditorPasos.iniciar();
  }
})();
