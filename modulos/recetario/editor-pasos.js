(function () {
  "use strict";

  const MIN_CARACTERES = 5;
  const MAX_CARACTERES = 500;

  // Estado interno: cada paso tiene un uid estable (no cambia al reordenar)
  let pasos = [];
  let contadorUid = 0;

  let raiz, lista, btnAgregar, anuncio;

  /* ---------- Modelo ---------- */

  function crearPaso(texto) {
    contadorUid += 1;
    return { uid: contadorUid, texto: texto || "", tocado: false };
  }

  function buscarIndice(uid) {
    return pasos.findIndex(p => p.uid === uid);
  }

  // Devuelve "" si es válido, o el mensaje de error
  function validarTexto(texto) {
    const limpio = texto.trim();
    if (limpio === "") return "Este paso es obligatorio. Describe qué hay que hacer.";
    if (limpio.length < MIN_CARACTERES) {
      return "El paso debe tener al menos " + MIN_CARACTERES + " caracteres.";
    }
    return "";
  }

  /* ---------- Vista ---------- */

  function crearBoton(accion, simbolo, etiqueta, deshabilitado) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "receta-editor-pasos__boton receta-editor-pasos__boton--" + accion;
    boton.dataset.accion = accion;
    boton.textContent = simbolo;
    boton.setAttribute("aria-label", etiqueta);
    boton.title = etiqueta;
    boton.disabled = deshabilitado;
    return boton;
  }

  function crearItem(paso, indice) {
    const numero = indice + 1;
    const idTexto = "receta-paso-texto-" + paso.uid;
    const idError = "receta-paso-error-" + paso.uid;

    const item = document.createElement("li");
    item.className = "receta-editor-pasos__item";
    item.dataset.uid = paso.uid;

    const encabezado = document.createElement("div");
    encabezado.className = "receta-editor-pasos__encabezado";

    const etiqueta = document.createElement("label");
    etiqueta.className = "receta-editor-pasos__etiqueta";
    etiqueta.htmlFor = idTexto;
    etiqueta.textContent = "Paso " + numero;

    const acciones = document.createElement("div");
    acciones.className = "receta-editor-pasos__acciones";
    acciones.setAttribute("role", "group");
    acciones.setAttribute("aria-label", "Acciones del paso " + numero);
    acciones.appendChild(crearBoton("subir", "▲", "Subir paso " + numero, indice === 0));
    acciones.appendChild(crearBoton("bajar", "▼", "Bajar paso " + numero, indice === pasos.length - 1));
    acciones.appendChild(crearBoton("eliminar", "✕", "Eliminar paso " + numero, pasos.length === 1));

    encabezado.appendChild(etiqueta);
    encabezado.appendChild(acciones);

    const textarea = document.createElement("textarea");
    textarea.className = "receta-editor-pasos__texto";
    textarea.id = idTexto;
    textarea.name = "paso";
    textarea.rows = 3;
    textarea.maxLength = MAX_CARACTERES;
    textarea.required = true;
    textarea.placeholder = "Ej. Mezcla la leche con el Chocolisto y calienta a fuego medio.";
    textarea.setAttribute("aria-describedby", idError);
    textarea.value = paso.texto;

    const error = document.createElement("p");
    error.className = "receta-editor-pasos__error receta-editor-pasos__error--oculto";
    error.id = idError;

    item.appendChild(encabezado);
    item.appendChild(textarea);
    item.appendChild(error);

    pintarError(item, paso);
    return item;
  }

  // Muestra u oculta el mensaje de error de un ítem según el estado del paso
  function pintarError(item, paso) {
    const textarea = item.querySelector("textarea");
    const error = item.querySelector(".receta-editor-pasos__error");
    const mensaje = paso.tocado ? validarTexto(paso.texto) : "";

    error.textContent = mensaje;
    error.classList.toggle("receta-editor-pasos__error--oculto", mensaje === "");
    textarea.classList.toggle("receta-editor-pasos__texto--invalido", mensaje !== "");
    textarea.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
  }

  // Reconstruye la lista. Opcionalmente devuelve el foco a un control del paso indicado.
  function renderizar(uidFoco, accionFoco) {
    lista.innerHTML = "";
    pasos.forEach(function (paso, indice) {
      lista.appendChild(crearItem(paso, indice));
    });

    if (uidFoco === undefined) return;
    const item = lista.querySelector('[data-uid="' + uidFoco + '"]');
    if (!item) return;

    let destino = accionFoco ? item.querySelector('[data-accion="' + accionFoco + '"]') : null;
    // Si el botón quedó deshabilitado (extremo de la lista), el foco va al textarea
    if (!destino || destino.disabled) destino = item.querySelector("textarea");
    destino.focus();
  }

  function anunciar(mensaje) {
    anuncio.textContent = mensaje;
  }

  /* ---------- Acciones ---------- */

  function agregarPaso() {
    const nuevo = crearPaso("");
    pasos.push(nuevo);
    renderizar(nuevo.uid);
    anunciar("Paso " + pasos.length + " agregado.");
  }

  function moverPaso(uid, desplazamiento, accion) {
    const indice = buscarIndice(uid);
    const destino = indice + desplazamiento;
    if (indice === -1 || destino < 0 || destino >= pasos.length) return;

    const temporal = pasos[indice];
    pasos[indice] = pasos[destino];
    pasos[destino] = temporal;

    renderizar(uid, accion);
    anunciar("Paso movido a la posición " + (destino + 1) + " de " + pasos.length + ".");
  }

  function eliminarPaso(uid) {
    if (pasos.length === 1) return; // siempre debe quedar al menos un paso
    const indice = buscarIndice(uid);
    if (indice === -1) return;

    pasos.splice(indice, 1);
    // El foco pasa al paso que ocupa ahora esa posición (o al último)
    const vecino = pasos[Math.min(indice, pasos.length - 1)];
    renderizar(vecino.uid);
    anunciar("Paso " + (indice + 1) + " eliminado. Quedan " + pasos.length + " pasos.");
  }

  /* ---------- Eventos (delegación sobre la lista) ---------- */

  function alHacerClic(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;
    const uid = Number(boton.closest("li").dataset.uid);

    if (boton.dataset.accion === "subir") moverPaso(uid, -1, "subir");
    if (boton.dataset.accion === "bajar") moverPaso(uid, 1, "bajar");
    if (boton.dataset.accion === "eliminar") eliminarPaso(uid);
  }

  function alEscribir(evento) {
    if (!evento.target.matches("textarea")) return;
    const item = evento.target.closest("li");
    const paso = pasos[buscarIndice(Number(item.dataset.uid))];
    paso.texto = evento.target.value;
    pintarError(item, paso); // solo muestra error si el campo ya fue tocado
  }

  function alSalirDelCampo(evento) {
    if (!evento.target.matches("textarea")) return;
    const item = evento.target.closest("li");
    const paso = pasos[buscarIndice(Number(item.dataset.uid))];
    paso.tocado = true;
    pintarError(item, paso);
  }

  /* ---------- API pública ---------- */

  // Valida todos los pasos; marca errores y enfoca el primero inválido
  function validar() {
    let primerInvalido = null;

    pasos.forEach(function (paso) {
      paso.tocado = true;
      if (validarTexto(paso.texto) !== "" && primerInvalido === null) {
        primerInvalido = paso.uid;
      }
    });

    renderizar(primerInvalido === null ? undefined : primerInvalido);
    return primerInvalido === null;
  }

  // Estructura final: la numeración se asigna aquí según la posición actual
  function obtenerPasos() {
    return pasos.map(function (paso, indice) {
      return {
        numero: indice + 1,
        descripcion: paso.texto.trim()
      };
    });
  }

  function iniciar(descripciones) {
    raiz = document.getElementById("receta-editor-pasos");
    if (!raiz) return;

    lista = raiz.querySelector('[data-pasos="lista"]');
    btnAgregar = raiz.querySelector('[data-pasos="agregar"]');
    anuncio = raiz.querySelector('[data-pasos="anuncio"]');

    const iniciales = (descripciones && descripciones.length) ? descripciones : [""];
    pasos = iniciales.map(crearPaso);

    lista.addEventListener("click", alHacerClic);
    lista.addEventListener("input", alEscribir);
    lista.addEventListener("focusout", alSalirDelCampo);
    btnAgregar.addEventListener("click", agregarPaso);

    renderizar();
  }

  window.recetaEditorPasos = {
    iniciar: iniciar,
    validar: validar,
    obtenerPasos: obtenerPasos
  };
})();
