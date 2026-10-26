(function () {
  window.recetarioServicio = {

    async listarTodos() {
      try {
        const respuesta = await fetch('https://6adb716c3b7e90b8208ff289.mockapi.io/recetas/api/v1/ingredientes');
        if (!respuesta.ok) throw new Error();
        return await respuesta.json();
      } catch (error) {
        console.error("Error obteniendo recetas:", error);
        return [];
      }
    },

  
    async obtenerIngredientes(idReceta) {
      try {
        // En una API real, se enviaría el ID como parámetro en la URL
        const respuesta = await fetch(`https://6adb716c3b7e90b8208ff289.mockapi.io/recetas/api/v1/ingredientes${idReceta}`);
        if (!respuesta.ok) throw new Error("Error API Ingredientes");
        
        return await respuesta.json();
      } catch (error) {
        console.error(`Error obteniendo ingredientes de receta ${idReceta}:`, error);
        
        return [
          { nombreProducto: "Queso Mozzarella", cantidad: 250.5, unidad: "g" },
          { nombreProducto: "Harina de maíz", cantidad: 1, unidad: "kg" },
          { nombreProducto: "Mantequilla", cantidad: 2, unidad: "cucharadas" }
        ];
      }
    }
  };
})();