self.addEventListener("install", () => {
    console.log("Nivers instalado");
});


self.addEventListener("activate", () => {
    console.log("Nivers ativo");
});


self.addEventListener("fetch", (event) => {
});