function cantidad()
{
    const consulta = localStorage.getItem("historial_local");
    const favorite = localStorage.getItem('favoritos');
    const atraccionfv = localStorage.getItem('atracciones_favoritas');
    // 2. Lo transformas de texto a Array de JavaScript
    const lista = JSON.parse(consulta);
    const favo = JSON.parse(favorite);
    const atraccion = JSON.parse(atraccionfv);
    // 3. Obtienes el total de elementos
    const totalElementos = lista.length;
    // Selecciona el elemento con id "mi-titulo" y cambia su texto
    document.getElementById("consultadostotal").textContent = lista.length;
    document.getElementById("fav").textContent = favo.length;
    document.getElementById("favactrac").textContent = atraccion.length;
}
cantidad();